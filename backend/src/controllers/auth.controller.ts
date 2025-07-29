import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ObjectId } from 'mongodb';

interface UserResponse {
    id: ObjectId;
    email: string;
    name: string;
    phoneNumber?: string;
    role: 'user' | 'admin';
    createdAt?: Date;
}

interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        token?: string;
        user?: UserResponse;
    };
}

export class AuthController {
    static async register(req: Request, res: Response<AuthResponse>): Promise<Response<AuthResponse>> {
        try {
            const user = await AuthService.register(req.body);
            return res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            return res.status(400).json({
                success: false,
                message
            });
        }
    }

    static async login(req: Request, res: Response<AuthResponse>): Promise<Response<AuthResponse>> {
        try {
            const { email, password } = req.body;
            const { user, token } = await AuthService.login(email, password);

            return res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return res.status(401).json({
                success: false,
                message
            });
        }
    }

    static async me(req: Request, res: Response<AuthResponse>): Promise<Response<AuthResponse>> {
        if (!req.authUser) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        try {
            const user = await AuthService.getUserById(req.authUser.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        phoneNumber: user.phoneNumber,
                        role: user.role,
                        createdAt: user.createdAt
                    }
                }
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Server error';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }
}