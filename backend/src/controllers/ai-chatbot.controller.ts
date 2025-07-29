// ai-chatbot.controller.ts
import { Request, Response } from 'express';
import { getAIResponse, getMemoryForThread } from '../agents/chatbot';
import { trimMemory } from '../services/chat-memory.service';

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    metadata?: {
        threadId?: string;
        messageCount?: number;
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
    return `chat_${userId}_${Date.now()}`;
};

export const aiChatbotController = {
    startChat: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
        try {
            const userId = req.authUser?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const threadId = generateThreadId(userId.toString());
            getMemoryForThread(threadId); // Initialize memory without greeting

            return res.status(201).json({
                success: true,
                metadata: {
                    threadId: threadId,
                    messageCount: 0
                }
            });
        } catch (error) {
            return handleError(res, error, 'Failed to start chat session');
        }
    },
    sendMessage: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
        try {
            const userId = req.authUser?.id;
            const { threadId, message } = req.body;

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

            if (!message || typeof message !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Valid message is required'
                });
            }

            // Get memory for this thread to check if it exists
            const memory = getMemoryForThread(threadId);
            const history = await memory.chatHistory.getMessages();


            // Trim memory if needed
            await trimMemory(threadId);

            // Get AI response
            const { response, suggestions } = await getAIResponse(message, threadId);

            return res.json({
                success: true,
                data: {
                    content: response,
                    suggestions
                },
                metadata: {
                    threadId: threadId,
                    messageCount: history.length + 1 // +1 for the new message
                }
            });
        } catch (error) {
            return handleError(res, error, 'Failed to process your message');
        }
    },

    getChatHistory: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
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

            // Verify thread belongs to user (basic check)
            if (!threadId.startsWith(`chat_${userId}_`)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access to this chat thread'
                });
            }

            const memory = getMemoryForThread(threadId);
            const messages = await memory.chatHistory.getMessages();

            // Format messages for client
            const formattedMessages = messages.map((msg: { _getType: () => unknown; content: unknown; }) => {
                return {
                    role: msg._getType(),
                    content: msg.content,
                    timestamp: new Date().toISOString() // You might want to store actual timestamps
                };
            });

            return res.json({
                success: true,
                data: {
                    messages: formattedMessages
                },
                metadata: {
                    threadId: threadId,
                    messageCount: messages.length
                }
            });
        } catch (error) {
            return handleError(res, error, 'Failed to retrieve chat history');
        }
    },

    clearChat: async (req: Request, res: Response<ApiResponse>): Promise<Response> => {
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

            // Verify thread belongs to user
            if (!threadId.startsWith(`chat_${userId}_`)) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access to this chat thread'
                });
            }

            const memory = getMemoryForThread(threadId);
            await memory.chatHistory.clear();

            return res.json({
                success: true,
                message: 'Chat history cleared successfully',
                metadata: {
                    threadId: threadId,
                    messageCount: 0
                }
            });
        } catch (error) {
            return handleError(res, error, 'Failed to clear chat history');
        }
    }
};