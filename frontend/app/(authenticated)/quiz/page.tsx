"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  AlertCircle,
  RotateCcw,
  FileText,
  BookOpen,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface QuestionOption {
  text: string;
  value: string;
}

interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
}

interface QuizMetadata {
  currentQuestion: number;
  totalQuestions: number;
  completionPercentage: number;
  threadId?: string;
}

type CareerSuggestion = {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  salaryRange: string;
  educationPath: string;
  jobMarket: "low" | "medium" | "high";
  fitScore: number;
  isGlobal: boolean;
  locationScope: string;
};

interface ApiResponse {
  success: boolean;
  message: string;
  data: Question | { careerSuggestions: CareerSuggestion[] };
  metadata: QuizMetadata;
}

export default function AIQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [metadata, setMetadata] = useState<QuizMetadata>({
    currentQuestion: 0,
    totalQuestions: 10,
    completionPercentage: 0,
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [careerSuggestions, setCareerSuggestions] = useState<
    CareerSuggestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasStarted, setHasStarted] = useState(false);

  const [isResumingQuiz, setIsResumingQuiz] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [incompleteQuizData, setIncompleteQuizData] = useState<any>(null);

  const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/ai-quiz`;

  // Check for incomplete quiz on component mount
  useEffect(() => {
    checkIncompleteQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkIncompleteQuiz = async () => {
    try {
      // Check if there's a stored threadId from previous session
      const storedThreadId = localStorage.getItem("quiz_thread_id");
      const storedQuizData = localStorage.getItem("quiz_session_data");

      if (storedThreadId && storedQuizData) {
        console.log("Found stored quiz session:", storedThreadId);

        const response = await fetch(`${BASE_URL}/progress/${storedThreadId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Progress data:", data);

          if (data.success && !data.metadata.isCompleted) {
            // Parse stored session data
            const sessionData = JSON.parse(storedQuizData);

            // Use current question from API if available
            if (data.data.currentQuestionData) {
              sessionData.currentQuestion = data.data.currentQuestionData;
            }

            setIncompleteQuizData({
              ...data,
              sessionData,
            });
            setShowResumePrompt(true);
            return;
          }
        }

        // Clean up invalid session data
        localStorage.removeItem("quiz_thread_id");
        localStorage.removeItem("quiz_session_data");
      }
    } catch (error) {
      console.error("Error checking incomplete quiz:", error);
      // Clean up on error
      localStorage.removeItem("quiz_thread_id");
      localStorage.removeItem("quiz_session_data");
    }
  };

  const resumeQuiz = async () => {
    if (incompleteQuizData) {
      try {
        setIsResumingQuiz(true);

        // Set the metadata first
        setMetadata((prev) => ({
          ...prev,
          currentQuestion: incompleteQuizData.metadata.currentQuestion,
          totalQuestions: incompleteQuizData.metadata.totalQuestions,
          completionPercentage:
            incompleteQuizData.metadata.completionPercentage,
          threadId:
            incompleteQuizData.metadata.threadId ||
            localStorage.getItem("quiz_thread_id") ||
            "",
        }));

        // Check if we have the current question in session data
        if (incompleteQuizData.sessionData?.currentQuestion) {
          setCurrentQuestion(incompleteQuizData.sessionData.currentQuestion);
          setHasStarted(true);
          setShowResumePrompt(false);
        } else {
          // If no current question in session data, fetch it from the server
          const response = await fetch(
            `${BASE_URL}/start/${incompleteQuizData.metadata.threadId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setCurrentQuestion(data.data);
              setHasStarted(true);
              setShowResumePrompt(false);
            } else {
              throw new Error("Failed to get current question");
            }
          } else {
            throw new Error("Failed to resume quiz");
          }
        }
      } catch (error) {
        console.error("Error resuming quiz:", error);
        setError("Failed to resume quiz. Starting a new one...");
        // Fall back to starting a fresh quiz
        await startFreshQuiz();
      } finally {
        setIsResumingQuiz(false);
      }
    }
  };

  const startFreshQuiz = async () => {
    // Clear stored data
    localStorage.removeItem("quiz_thread_id");
    localStorage.removeItem("quiz_session_data");
    setShowResumePrompt(false);
    setIncompleteQuizData(null);

    // Reset all state
    setCurrentQuestion(null);
    setMetadata({
      currentQuestion: 0,
      totalQuestions: 10,
      completionPercentage: 0,
    });
    setSelectedAnswer("");
    setCareerSuggestions([]);
    setIsCompleted(false);
    setError("");
    setHasStarted(false);

    // Start a new quiz immediately
    await startQuiz();
  };

  const startQuiz = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to start quiz");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        const questionData = data.data as Question;
        setCurrentQuestion(questionData);
        setMetadata(data.metadata);
        setHasStarted(true);

        // Store threadId and initial session data for resuming later
        if (data.metadata.threadId) {
          localStorage.setItem("quiz_thread_id", data.metadata.threadId);
          localStorage.setItem(
            "quiz_session_data",
            JSON.stringify({
              currentQuestion: questionData,
              metadata: data.metadata,
              timestamp: Date.now(),
            })
          );
        }
      } else {
        setError(data.message || "Failed to start quiz");
      }
    } catch (error) {
      setError("Unable to connect to the quiz service. Please try again.");
      console.error("Error starting quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !metadata.threadId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          threadId: metadata.threadId,
          answer: selectedAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        const newMetadata = {
          ...metadata,
          currentQuestion: data.metadata.currentQuestion,
          totalQuestions: data.metadata.totalQuestions,
          completionPercentage: data.metadata.completionPercentage,
        };

        setMetadata(newMetadata);

        if (data.metadata.completionPercentage === 100) {
          // Quiz completed - show results
          const suggestionData = data.data as {
            careerSuggestions: CareerSuggestion[];
          };
          setCareerSuggestions(suggestionData.careerSuggestions);
          setIsCompleted(true);
          localStorage.removeItem("quiz_thread_id");
          localStorage.removeItem("quiz_session_data");
        } else {
          // Next question - save progress
          const nextQuestion = data.data as Question;
          setCurrentQuestion(nextQuestion);
          setSelectedAnswer("");

          // Update stored session data
          localStorage.setItem(
            "quiz_session_data",
            JSON.stringify({
              currentQuestion: nextQuestion,
              metadata: newMetadata,
              timestamp: Date.now(),
            })
          );
        }
      } else {
        setError(data.message || "Failed to submit answer");
      }
    } catch (error) {
      setError("Unable to submit answer. Please try again.");
      console.error("Error submitting answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(null);
    setMetadata({
      currentQuestion: 0,
      totalQuestions: 10,
      completionPercentage: 0,
    });
    setSelectedAnswer("");
    setCareerSuggestions([]);
    setIsCompleted(false);
    setError("");
    setHasStarted(false);
    setShowResumePrompt(false);
    setIncompleteQuizData(null);
    localStorage.removeItem("quiz_thread_id");
    localStorage.removeItem("quiz_session_data");
  };

  // Loading state for quiz initialization
  if (isLoading && !hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Starting Your Assessment
            </h3>
            <p className="text-gray-600">Preparing personalized questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resume quiz prompt
  if (showResumePrompt && incompleteQuizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-blue-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Resume Your Quiz?
                </CardTitle>
                <p className="text-gray-600">
                  We found an incomplete career assessment from your previous
                  session.
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      Question {incompleteQuizData.metadata.currentQuestion} of{" "}
                      {incompleteQuizData.metadata.totalQuestions}
                    </span>
                  </div>
                  <Progress
                    value={incompleteQuizData.metadata.completionPercentage}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {incompleteQuizData.metadata.completionPercentage}%
                    completed
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={resumeQuiz}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isResumingQuiz}
                  >
                    {isResumingQuiz ? "Resuming..." : "Continue Quiz"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    onClick={startFreshQuiz}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    Start New Quiz
                    <RotateCcw className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results page - Updated version
  if (isCompleted && careerSuggestions.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your AI-Generated Career Recommendations
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Based on your responses, here are personalized career matches
              ranked by compatibility with your skills and preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12">
            {careerSuggestions.map((career, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg cursor-pointer transition-shadow duration-300 border border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {career.title}
                        </CardTitle>
                        <p className="text-gray-600 text-sm mt-1">
                          {career.description}
                        </p>
                      </div>
                      <div className="relative w-36 h-20 ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Filled", value: career.fitScore },
                                {
                                  name: "Remaining",
                                  value: 100 - career.fitScore,
                                },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={30}
                              paddingAngle={0}
                              dataKey="value"
                            >
                              <Cell key="filled" fill="#3b82f6" />
                              <Cell key="remaining" fill="#e5e7eb" />
                            </Pie>
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-sm font-bold"
                            >
                              {career.fitScore}%
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Salary and Job Market */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                            Salary Range
                          </h4>
                          <p className="text-sm font-medium text-gray-900">
                            {career.salaryRange}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            career.jobMarket === "high"
                              ? "bg-green-50"
                              : career.jobMarket === "medium"
                              ? "bg-yellow-50"
                              : "bg-red-50"
                          }`}
                        >
                          <h4 className="text-xs font-semibold uppercase tracking-wider mb-1">
                            Job Market
                          </h4>
                          <p
                            className={`text-sm font-medium ${
                              career.jobMarket === "high"
                                ? "text-green-800"
                                : career.jobMarket === "medium"
                                ? "text-yellow-800"
                                : "text-red-800"
                            }`}
                          >
                            {career.jobMarket === "high"
                              ? "High Demand"
                              : career.jobMarket === "medium"
                              ? "Moderate Demand"
                              : "Low Demand"}
                          </p>
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-2">
                            Advantages
                          </h4>
                          <ul className="space-y-1">
                            {career.pros.slice(0, 3).map((pro, i) => (
                              <li
                                key={i}
                                className="flex items-start text-sm text-gray-700"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-2">
                            Considerations
                          </h4>
                          <ul className="space-y-1">
                            {career.cons.slice(0, 3).map((con, i) => (
                              <li
                                key={i}
                                className="flex items-start text-sm text-gray-700"
                              >
                                <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Education Path */}
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">
                          Education Path
                        </h4>
                        <p className="text-sm text-gray-700">
                          {career.educationPath}
                        </p>
                      </div>

                      {/* Location Scope */}
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-1">
                          Scope
                        </h4>
                        <p className="text-sm text-gray-700">
                          {career.locationScope}{" "}
                          {career.isGlobal && (
                            <span className="text-indigo-600">
                              (Global Opportunity)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/chat">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Personalized Advice
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/resume/classic">
                  <FileText className="h-4 w-4 mr-2" />
                  Build Resume
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Explore Courses
                </Link>
              </Button>
            </div>
            <div className="pt-4">
              <Button
                onClick={restartQuiz}
                variant="ghost"
                className="text-blue-600 hover:bg-blue-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Start screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="p-8">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-gray-800" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  AI-Powered Career Assessment
                </CardTitle>
                <p className="text-gray-600 text-lg mb-6">
                  Discover your ideal career path with our intelligent
                  assessment that adapts to your responses
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      Dynamic questions based on your answers
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      AI-generated career recommendations
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      Detailed career insights and salary information
                    </span>
                  </div>
                  <div className="flex items-center text-left">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      Resume incomplete assessments anytime
                    </span>
                  </div>
                </div>

                {error && (
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={startQuiz}
                  disabled={isLoading}
                  className="bg-gray-800 cursor-pointer hover:bg-gray-700 text-white px-8 py-3 text-lg"
                >
                  {isLoading ? "Starting..." : "Start Career Assessment"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                AI Career Assessment
              </h1>
              <span className="text-sm text-gray-600">
                Question {metadata.currentQuestion} of {metadata.totalQuestions}
              </span>
            </div>
            <Progress value={metadata.completionPercentage} className="h-2" />
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {currentQuestion?.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={selectedAnswer}
                    onValueChange={setSelectedAnswer}
                  >
                    {currentQuestion?.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 my-2"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                        />
                        <Label
                          htmlFor={option.value}
                          className="cursor-pointer"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
              className="cursor-pointer hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={submitAnswer}
              disabled={!selectedAnswer || isLoading}
              className="bg-gray-800 cursor-pointer hover:bg-gray-700"
            >
              {isLoading
                ? "Processing..."
                : metadata.currentQuestion === metadata.totalQuestions
                ? "Complete Assessment"
                : "Next Question"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
