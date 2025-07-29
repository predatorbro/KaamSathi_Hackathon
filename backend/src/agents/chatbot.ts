import { GoogleGenerativeAI } from "@google/generative-ai";
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/memory";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your-google-api-key");

const SYSTEM_PROMPT = `You are KaamSathi, a friendly AI career advisor for Nepali youth. Follow these guidelines:

1. RESPONSE STYLE:
- Be extremely concise (1-2 short paragraphs max)
- Use simple language and short sentences
- Present information in bullet points when possible
- Keep answers focused and practical

2. CONTENT PRIORITIES:
- Provide key facts first
- Highlight most important steps
- Give specific examples when helpful
- Include Nepali context (salaries, opportunities)

3. BILINGUAL SUPPORT:
- Respond in the user's language (Nepali/English)
- Keep technical terms minimal
- Explain complex concepts simply

4. FORMATTING:
- Use clear section headings
- Break down complex answers
- End with clear next steps

5. SUGGESTIONS:
- After the main answer, include 3-4 short action-oriented suggestions
- Suggestions should be informative statements that users can explore
- Each suggestion should begin with a verb (e.g., "Learn more about...", "Discover...", "Explore...")
- Keep suggestions relevant to the current topic
- Always output suggestions as **pure JSON** on the last line
- Format must be exactly: {"suggestions": ["suggestion 1", "suggestion 2"]}
- The JSON must be the very last content in your response

Example suggestions format:
{"suggestions": [
  "Discover the top 5 in-demand skills in Nepal's job market",
  "Learn about average salaries for entry-level positions in your field",
  "Explore government scholarship programs for skill development"
]}`;

const threadMemoryMap = new Map<string, BufferMemory>();

export function getMemoryForThread(threadId: string): BufferMemory {
  if (!threadMemoryMap.has(threadId)) {
    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(),
      returnMessages: true,
      memoryKey: "history",
      inputKey: "input",
      outputKey: "output",
    });
    threadMemoryMap.set(threadId, memory);
  }
  return threadMemoryMap.get(threadId)!;
}

function extractSuggestionsAndCleanResponse(fullText: string): { cleanResponse: string; suggestions: string[] } {
  // Initialize default values
  let cleanResponse = fullText;
  let suggestions: string[] = [];

  // First try to find JSON at the end (most common case)
  const jsonEndRegex = /(\{[\s]*"suggestions"[\s]*:[\s]*\[.*?\][\s]*\})[\s]*$/s;
  const endMatch = fullText.match(jsonEndRegex);

  if (endMatch && endMatch[1]) {
    try {
      const parsed = JSON.parse(endMatch[1]);
      if (parsed && Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions
          .filter((s: string) => typeof s === 'string')
          .map((s: string) => s.trim())
          .filter(Boolean);

        cleanResponse = fullText.slice(0, endMatch.index).trim();
      }
    } catch (err) {
      console.warn("Failed to parse end-of-response suggestions JSON:", err);
    }
  }

  // If no suggestions found at end, try to find anywhere in the response
  if (suggestions.length === 0) {
    const jsonAnywhereRegex = /(\{[\s]*"suggestions"[\s]*:[\s]*\[.*?\][\s]*\})/s;
    const anywhereMatch = fullText.match(jsonAnywhereRegex);

    if (anywhereMatch && anywhereMatch[1]) {
      try {
        const parsed = JSON.parse(anywhereMatch[1]);
        if (parsed && Array.isArray(parsed.suggestions)) {
          suggestions = parsed.suggestions
            .filter((s: string) => typeof s === 'string')
            .map((s: string) => s.trim())
            .filter(Boolean);

          cleanResponse = fullText.replace(anywhereMatch[1], '').trim();
        }
      } catch (err) {
        console.warn("Failed to parse anywhere-in-response suggestions JSON:", err);
      }
    }
  }

  // Final cleanup of any remaining JSON artifacts
  cleanResponse = cleanResponse
    .replace(/\{\s*"suggestions"\s*:\s*\[.*?\]\s*\}/gs, '')
    .trim();

  // Fallback if no valid suggestions found
  if (suggestions.length === 0) {
    suggestions = [
      "What are the best career options in Nepal right now?",
      "How can I improve my skills for better jobs?",
      "What are the average salaries for entry-level positions?"
    ];
  }

  return { cleanResponse, suggestions };
}

export async function getAIResponse(
  question: string,
  threadId: string
): Promise<{ response: string; suggestions: string[] }> {
  try {
    const memory = getMemoryForThread(threadId);

    // Add user message to history
    await memory.chatHistory.addMessage(new HumanMessage({ content: question }));

    // Get conversation history and include system prompt
    const messages = [
      ...(await memory.chatHistory.getMessages()),
      new SystemMessage(SYSTEM_PROMPT),
    ];

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Convert messages to Gemini format
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg._getType() === "human" ? "user" : "model",
        parts: [{ text: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content) }],
      })),
    });

    // Get AI response
    const result = await chat.sendMessage(question);
    const response = result.response;
    const fullText = response.text();

    // Extract suggestions and clean response
    const { cleanResponse, suggestions } = extractSuggestionsAndCleanResponse(fullText);

    // Add assistant response to memory (without system prompt)
    await memory.chatHistory.addMessage(new AIMessage({
      content: cleanResponse,
      additional_kwargs: {
        suggestions: suggestions,
      },
    }));

    return {
      response: cleanResponse,
      suggestions: suggestions,
    };
  } catch (error) {
    console.error("AI response error:", error);
    throw new Error("Failed to process your request. Please try again.");
  }
}