// advanced-career-quiz.service.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
    }
});

interface QuizQuestion {
    id: number;
    question: string;
    options?: {
        text: string;
        value: string;
    }[];
}

interface UserAnswer {
    questionId: number;
    answer: string;
    timestamp: Date;
}

interface QuizSession {
    userId: string;
    threadId: string;
    currentQuestion: number;
    completed: boolean;
    questions: QuizQuestion[];
    answers: UserAnswer[];
    careerSuggestions?: CareerSuggestion[];
}

interface CareerSuggestion {
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    salaryRange: string; // Always in NPR for Nepal, converted to NPR for global
    educationPath: string;
    jobMarket: 'high' | 'medium' | 'low';
    fitScore: number;
    isGlobal?: boolean; // Added to distinguish global opportunities
    locationScope?: string; // Added to show if it's Nepal-specific or global
}

const quizSessions: Record<string, QuizSession> = {};

export async function startQuiz(userId: string, threadId: string): Promise<QuizQuestion> {
    const firstQuestion = await generateNextQuestion([], []);
    quizSessions[threadId] = {
        userId,
        threadId,
        currentQuestion: 1,
        completed: false,
        questions: [firstQuestion],
        answers: []
    };

    return firstQuestion;
}

export async function submitAnswer(
    threadId: string,
    answer: string
): Promise<QuizQuestion | { careerSuggestions: CareerSuggestion[] }> {
    const session = quizSessions[threadId];
    if (!session) throw new Error("Quiz session not found");

    // Store answer with validation
    const currentQuestion = session.questions[session.questions.length - 1];
    session.answers.push({
        questionId: currentQuestion.id,
        answer: answer.trim(),
        timestamp: new Date()
    });

    if (session.answers.length >= 10) {
        session.completed = true;
        session.careerSuggestions = await generateCareerSuggestions(session.questions, session.answers);
        return { careerSuggestions: session.careerSuggestions };
    }
    const nextQuestion = await generateNextQuestion(session.questions, session.answers);
    session.questions.push(nextQuestion);
    session.currentQuestion++;

    return nextQuestion;
}

async function generateNextQuestion(
    previousQuestions: QuizQuestion[],
    previousAnswers: UserAnswer[]
): Promise<QuizQuestion> {
    const nextId = previousQuestions.length + 1;

    try {
        let prompt = `Generate a career assessment question that helps identify suitable career paths.`;

        if (previousQuestions.length > 0) {
            prompt += `\n\nContext from previous answers:`;
            previousAnswers.forEach((ans, idx) => {
                prompt += `\nQ${idx + 1}: ${previousQuestions[idx].question}\nA: ${ans.answer}`;
            });

            // Detect if user has shown preference for global or Nepal opportunities
            const globalKeywords = ['global', 'international', 'remote', 'abroad', 'overseas'];
            const nepalKeywords = ['nepal', 'local', 'kathmandu', 'within country'];

            const answersText = previousAnswers.map(a => a.answer.toLowerCase()).join(' ');
            const isGlobalPreferred = globalKeywords.some(kw => answersText.includes(kw));
            const isNepalPreferred = nepalKeywords.some(kw => answersText.includes(kw));

            if (isGlobalPreferred && !isNepalPreferred) {
                prompt += `\n\nThe user seems interested in global career opportunities.`;
            } else if (isNepalPreferred && !isGlobalPreferred) {
                prompt += `\n\nThe user seems interested in Nepal-specific career opportunities.`;
            }
        }

        prompt += `\n\nGenerate a question with 3-4 multiple choice options that:
    - Helps identify suitable career paths
    - Can reveal preferences for local (Nepal) or global opportunities
    - Avoids yes/no questions
    
    Format response strictly as JSON:
    {
      "id": ${nextId},
      "question": "Your question here?",
      "options": [
        {"text": "Option 1", "value": "opt1"},
        {"text": "Option 2", "value": "opt2"}
      ]
    }`;

        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        const parsed = extractAndParseJSON(response);

        // Validate structure
        if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
            throw new Error("Invalid question structure from AI");
        }

        return {
            id: nextId,
            question: parsed.question.trim(),
            options: parsed.options.map((opt: { text: string; value: string; }) => ({
                text: opt.text?.trim() || "",
                value: opt.value?.trim() || opt.text?.trim().toLowerCase().replace(/\s+/g, '_') || ""
            }))
        };
    } catch (error) {
        console.error("Question generation error:", error);
        return getFallbackQuestion(nextId);
    }
}

async function generateCareerSuggestions(
    questions: QuizQuestion[],
    answers: UserAnswer[]
): Promise<CareerSuggestion[]> {
    try {
        const qaHistory = questions.map((q, i) =>
            `Q${i + 1}: ${q.question}\nA: ${answers[i]?.answer || "N/A"}`
        ).join("\n\n");

        // Analyze answers for location preference
        const allAnswers = answers.map(a => a.answer.toLowerCase()).join(' ');
        const isGlobalPreferred = allAnswers.includes('global') || allAnswers.includes('international') ||
            allAnswers.includes('remote') || allAnswers.includes('abroad');
        const isNepalPreferred = allAnswers.includes('nepal') || allAnswers.includes('local') ||
            allAnswers.includes('kathmandu') || allAnswers.includes('within country');

        const locationContext = isGlobalPreferred && !isNepalPreferred ? "Focus more on global opportunities but include some Nepal options if relevant." :
            !isGlobalPreferred && isNepalPreferred ? "Focus exclusively on Nepal's job market." :
                "Provide a mix of both Nepal-specific and global career opportunities.";

        const prompt = `Act as a professional career counselor. Analyze these career assessment responses and suggest 3-5 career paths:

    ${qaHistory}
    
    ${locationContext}
    
    For each career, provide:
    - Title: Career title
    - description: 1-2 sentence overview
    - pros: 3 advantages (bullet points)
    - cons: 3 challenges (bullet points)
    - salaryRange: Typical salary range in Nepalese Rupees (NPR) - convert global salaries to NPR
    - educationPath: Required education/certifications
    - jobMarket: Demand level (high/medium/low) - specify if it's global or Nepal demand
    - fitScore: 0-100 match score
    - isGlobal: true if this is primarily a global opportunity
    - locationScope: "Nepal" or "Global" or "Global (remote)" or "Nepal with global potential"
    
    Important:
    - For Nepal-specific careers, focus on local context
    - For global careers, mention remote work potential where applicable
    - Always show salary in NPR (convert if needed)
    - Include both traditional and emerging careers
    
    Format output as a JSON array ONLY:
    [
      { 
        "title": "...",
        "description": "...",
        "pros": ["...", "...", "..."],
        "cons": ["...", "...", "..."],
        "salaryRange": "... NPR",
        "educationPath": "...",
        "jobMarket": "...",
        "fitScore": ...,
        "isGlobal": ...,
        "locationScope": "..."
      }
    ]`;

        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        const suggestions: CareerSuggestion[] = extractAndParseJSON(response);

        // Validate and normalize suggestions
        return suggestions
            .filter(s => s.title && s.description)
            .map(s => ({
                title: s.title.trim(),
                description: s.description.trim(),
                pros: s.pros?.slice(0, 3) || [],
                cons: s.cons?.slice(0, 3) || [],
                salaryRange: s.salaryRange || "Varies by location/experience",
                educationPath: s.educationPath || "Typically requires relevant education/training",
                jobMarket: ["high", "medium", "low"].includes(s.jobMarket) ? s.jobMarket : "medium",
                fitScore: Math.min(100, Math.max(0, s.fitScore || 50)),
                isGlobal: s.isGlobal || false,
                locationScope: s.locationScope || (s.isGlobal ? "Global" : "Nepal")
            }))
            .sort((a, b) => b.fitScore - a.fitScore);
    } catch (error) {
        console.error("Suggestion generation error:", error);
        return getFallbackSuggestions();
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAndParseJSON(text: string): any {
    const jsonPattern = /```json\n?([\s\S]*?)\n?```|({[\s\S]*})|(\[[\s\S]*\])/;
    const match = text.match(jsonPattern);

    try {
        return match ? JSON.parse(match[1] || match[0]) : JSON.parse(text);
    } catch {
        // Final fallback to prevent complete failure
        return {};
    }
}

export function getQuizSession(threadId: string): QuizSession | undefined {
    return quizSessions[threadId];
}

function getFallbackQuestion(id: number): QuizQuestion {
    const fallbacks = [
        {
            question: "Which type of career opportunities interest you most?",
            options: [
                "Nepal-based traditional careers",
                "Global/remote opportunities",
                "Both Nepal and international options",
                "Entrepreneurship/starting my own business"
            ]
        },
        {
            question: "What's your preferred work location scope?",
            options: [
                "Only within Nepal",
                "Remote work for international companies",
                "Opportunities to work abroad",
                "Flexible - both Nepal and global options"
            ]
        }
    ];

    const fallback = fallbacks[id % fallbacks.length] || fallbacks[0];
    return {
        id,
        question: fallback.question,
        options: fallback.options.map((opt, i) => ({
            text: opt,
            value: `opt${i + 1}`
        }))
    };
}

function getFallbackSuggestions(): CareerSuggestion[] {
    return [
        {
            title: "IT Professional (Global Remote)",
            description: "Develop software solutions for international clients while working remotely from Nepal",
            pros: [
                "Earn global salaries while living in Nepal",
                "Growing demand for remote tech talent worldwide",
                "Flexibility to work from anywhere"
            ],
            cons: [
                "Need to work across time zones",
                "Requires strong self-discipline",
                "Competitive global market"
            ],
            salaryRange: "NPR 100,000 - 500,000+ per month (equivalent)",
            educationPath: "Bachelor's in Computer Science + relevant certifications",
            jobMarket: "high",
            fitScore: 85,
            isGlobal: true,
            locationScope: "Global (remote)"
        },
        {
            title: "Tourism Manager (Nepal)",
            description: "Manage hospitality businesses or tour operations in Nepal's growing tourism sector",
            pros: [
                "Opportunity to work in Nepal's key economic sector",
                "Cultural exchange with international visitors",
                "Potential to start own business after gaining experience"
            ],
            cons: [
                "Seasonal fluctuations in business",
                "Long working hours during peak seasons",
                "Impacted by global events and political stability"
            ],
            salaryRange: "NPR 30,000 - 80,000 per month",
            educationPath: "Hotel Management degree + language skills",
            jobMarket: "medium",
            fitScore: 78,
            isGlobal: false,
            locationScope: "Nepal"
        },
        {
            title: "Digital Marketing Specialist",
            description: "Help businesses grow their online presence, working for either Nepali or international clients",
            pros: [
                "Can work with both local and global clients",
                "High demand across industries",
                "Opportunities for freelance work"
            ],
            cons: [
                "Need to constantly update skills",
                "Can be highly competitive",
                "Performance-driven with tight deadlines"
            ],
            salaryRange: "NPR 40,000 - 200,000+ per month (depending on clients)",
            educationPath: "Marketing degree + digital certifications (Google Ads, SEO, etc.)",
            jobMarket: "high",
            fitScore: 80,
            isGlobal: true,
            locationScope: "Nepal with global potential"
        }
    ];
}

export function getCareerSuggestionDetails(
    threadId: string,
    suggestionIndex: number
): CareerSuggestion | null {
    const session = quizSessions[threadId];
    if (!session || !session.careerSuggestions) {
        return null;
    }

    if (suggestionIndex >= session.careerSuggestions.length || suggestionIndex < 0) {
        return null;
    }

    return session.careerSuggestions[suggestionIndex];
}