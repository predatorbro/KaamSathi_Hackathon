"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "@/lib/axios";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  role: "human" | "ai";
  suggestions?: string[];
  timestamp?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  metadata?: {
    threadId?: string;
    messageCount?: number;
  };
}

interface ChatMessageResponse {
  content: string;
  suggestions: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        setError(null);
        setIsLoading(true);

        // Check for existing thread
        const storedThreadId = localStorage.getItem("threadId");
        if (storedThreadId) {
          try {
            const { data } = await axios.get<
              ApiResponse<{ messages: Message[] }>
            >(`/api/ai-chatbot/history/${storedThreadId}`);

            if (data?.success && (data.data?.messages ?? []).length > 0) {
              setMessages(data.data?.messages ?? []);
              setThreadId(storedThreadId);
              return;
            }
          } catch (err) {
            console.warn("Failed to load chat history:", err);
          }
        }

        // Start new chat if no existing thread or history load failed
        const { data } = await axios.post<ApiResponse<{ threadId: string }>>(
          "/api/ai-chatbot/start"
        );

        if (!data?.success || !data.metadata?.threadId) {
          throw new Error(data?.message || "Failed to start chat");
        }

        localStorage.setItem("threadId", data.metadata.threadId);
        setThreadId(data.metadata.threadId);
      } catch (err) {
        console.error("Chat initialization error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize chat"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, []);

  // Scroll to bottom on messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !threadId || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      role: "human", // Changed from "user" to "human" to match the interface
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      const { data } = await axios.post<ApiResponse<ChatMessageResponse>>(
        "/api/ai-chatbot/send",
        {
          threadId,
          message: input,
        }
      );

      if (!data?.success) {
        throw new Error(data?.message || "Failed to get response");
      }

      const reply: Message = {
        id: crypto.randomUUID(),
        content:
          data.data?.content || "Sorry, I couldn't process that request.",
        role: "ai", // Changed from "assistant" to "ai" to match the interface
        suggestions: data.data?.suggestions,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error("Message send error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: "Sorry, I encountered an error. Please try again.",
          role: "ai", // Changed from "assistant" to "ai"
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Use setTimeout to ensure the input is updated before submission
    setTimeout(() => {
      handleSubmit();
    }, 0);
  };

  // Get the last assistant message's suggestions
  const lastAssistantMessage = messages
    .slice()
    .reverse()
    .find((msg) => msg.role === "ai");
  const currentSuggestions = lastAssistantMessage?.suggestions || [];

  // Fallback suggestions for empty chat
  const fallbackSuggestions = [
    "What career is best for me with a computer science background?",
    "How can I prepare for job interviews in Nepal?",
    "What skills should I learn for remote work opportunities?",
    "How to write a good resume for Nepali companies?",
  ];

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="flex flex-col h-[calc(100vh-8rem)] sm:h-[80vh]">
            <CardHeader className="border-b border-gray-200 flex-shrink-0 px-4 py-4 sm:px-6">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                <span>AI Career Chat</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 min-h-[75vh]">
              <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 space-y-4 overflow-y-auto">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong>Error: </strong>
                    {error}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 hover:cursor-pointer"
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {messages.length === 0 && !isLoading && (
                  <div className="text-center py-4 sm:py-8">
                    <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      How can I help with your career today?
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
                      Ask me about careers, jobs, skills, or professional
                      development in Nepal.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto">
                      {fallbackSuggestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left h-auto p-3 text-xs sm:text-sm bg-transparent break-words whitespace-normal hover:cursor-pointer"
                          onClick={() => handleSuggestionClick(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      message.role === "human" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-3xl ${
                        message.role === "human"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 ml-2 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          message.role === "human"
                            ? "bg-blue-600"
                            : "bg-green-500"
                        }`}
                      >
                        {message.role === "human" ? (
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        ) : (
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        )}
                      </div>

                      <div
                        className={`rounded-xl px-3 py-2 sm:px-4 sm:py-2 break-words overflow-wrap-anywhere ${
                          message.role === "human"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="text-sm sm:text-base leading-relaxed">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.timestamp && (
                          <p
                            className={`text-xs mt-1 ${
                              message.role === "human"
                                ? "text-blue-200"
                                : "text-gray-500"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-3xl">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <div className="rounded-xl px-3 py-2 sm:px-4 sm:py-2 bg-gray-100">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          <span className="text-gray-600 text-sm sm:text-base">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display suggestions from last assistant message */}
                {currentSuggestions.length > 0 && !isLoading && (
                  <div className="flex justify-start pt-4">
                    <div className="flex space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-3xl">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </div>
                      <div className="rounded-xl px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 w-full">
                        <p className="text-xs text-gray-500 mb-2">
                          You might want to ask:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {currentSuggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="text-left h-auto p-2 text-xs sm:text-sm bg-white break-words whitespace-normal hover:cursor-pointer"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                >
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me about careers, jobs, skills, or anything related to professional development in Nepal..."
                      className="min-h-[60px] sm:min-h-[60px] resize-none text-sm sm:text-base hover:cursor-text"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gray-800 hover:bg-gray-700 self-end sm:self-auto px-4 py-2 sm:px-4 sm:py-2 hover:cursor-pointer"
                    size="sm"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span className="ml-2 sm:hidden">Send</span>
                      </>
                    )}
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
