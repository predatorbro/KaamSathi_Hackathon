// ai-quiz.controller.ts
import { Request, Response } from 'express';
import { getCareerSuggestionDetails, getQuizSession, startQuiz, submitAnswer } from '../services/ai-quiz.service';

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    metadata?: {
        currentQuestion?: number;
        totalQuestions?: number;
        completionPercentage?: number;
        isCompleted?: boolean;
        threadId?: string;
    };
}

const handleError = (res: Response, error: unknown, defaultMessage: string): Response => {
    console.error(error);
    const message = error instanceof Error ? error.message : defaultMessage;
    return res.status(500).json({
        success: false,
        message
    });
};

const generateThreadId = (userId: string): string => {
    return `thread_${userId}_${Date.now()}`;
};

export const aiQuizController = {
    startQuiz: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
        try {
            const userId = req.authUser?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to start the quiz.'
                });
            }

            const threadId = generateThreadId(userId.toString());
            const firstQuestion = await startQuiz(userId.toString(), threadId);

            return res.status(201).json({
                success: true,
                message: 'Quiz started successfully',
                data: firstQuestion,
                metadata: {
                    currentQuestion: 1,
                    totalQuestions: 10,
                    completionPercentage: 0,
                    threadId: threadId
                }
            });
        } catch (error) {
            return handleError(res, error, 'Failed to start quiz');
        }
    },

    submitAnswer: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
        try {
            const userId = req.authUser?.id;
            const { threadId, answer } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!threadId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thread ID is required'
                });
            }

            if (!answer || typeof answer !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid answer is required'
                });
            }

            const result = await submitAnswer(threadId, answer);
            const session = getQuizSession(threadId);

            if ('careerSuggestions' in result) {
                return res.json({
                    success: true,
                    message: 'Quiz completed successfully!',
                    data: result,
                    metadata: {
                        currentQuestion: 10,
                        totalQuestions: 10,
                        completionPercentage: 100
                    }
                });
            }

            return res.json({
                success: true,
                message: 'Answer submitted successfully',
                data: result,
                metadata: {
                    currentQuestion: session?.currentQuestion || 0,
                    totalQuestions: 10,
                    completionPercentage: ((session?.answers.length || 0) / 10) * 100
                }
            });
        } catch (error) {
            return handleError(res, error, 'Failed to submit answer');
        }
    },

    getProgress: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
        try {
            const userId = req.authUser?.id;
            const { threadId } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!threadId) {
                return res.status(400).json({
                    success: false,
                    message: 'Thread ID is required'
                });
            }

            const session = getQuizSession(threadId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'No active quiz session found'
                });
            }

            if (session.userId !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access to this quiz session'
                });
            }

            return res.json({
                success: true,
                data: {
                    ...session,
                    answers: undefined
                },
                metadata: {
                    currentQuestion: session.currentQuestion,
                    totalQuestions: 10,
                    completionPercentage: (session.answers.length / 10) * 100,
                    isCompleted: session.completed
                }
            });
        } catch (error) {
            return handleError(res, error, 'Failed to get quiz progress');
        }
    },

    getSuggestionDetails: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
        try {
            const userId = req.authUser?.id;
            const { threadId, suggestionIndex } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const index = parseInt(suggestionIndex);
            if (isNaN(index)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid suggestion index'
                });
            }

            const session = getQuizSession(threadId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    message: 'No quiz session found'
                });
            }

            if (session.userId !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access to this quiz session'
                });
            }

            if (!session.completed) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz must be completed to view suggestions'
                });
            }

            const suggestion = getCareerSuggestionDetails(threadId, index);
            if (!suggestion) {
                return res.status(404).json({
                    success: false,
                    message: 'Suggestion not found'
                });
            }

            return res.json({
                success: true,
                data: suggestion
            });
        } catch (error) {
            return handleError(res, error, 'Failed to get suggestion details');
        }
    }
};