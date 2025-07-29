import {
  AIMessage,
  HumanMessage,
  isAIMessage,
  isHumanMessage,
} from "@langchain/core/messages";
import { getMemoryForThread } from "../agents/chatbot";

const MAX_MESSAGES = 50;

export async function trimMemory(threadId: string) {
  const memory = getMemoryForThread(threadId);
  const history = await memory.chatHistory.getMessages();

  if (history.length > MAX_MESSAGES) {
    const trimmedMessages = history.slice(-MAX_MESSAGES);
    await memory.chatHistory.clear();

    for (const msg of trimmedMessages) {
      const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
      if (isHumanMessage(msg)) {
        await memory.chatHistory.addMessage(new HumanMessage({ content }));
      } else if (isAIMessage(msg)) {
        await memory.chatHistory.addMessage(new AIMessage({ content }));
      }
    }
  }
}