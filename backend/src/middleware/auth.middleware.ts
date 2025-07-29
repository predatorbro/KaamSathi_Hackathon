import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthService } from "../services/auth.service";
import { ObjectId } from "mongodb";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
}

declare module "express" {
    interface Request {
        authUser?: {
            id: ObjectId;
            email: string;
            role: 'user' | 'admin';
        };
    }
}
/**
 * Optional Authentication Middleware
 * 1. Tries to extract JWT token from headers if present
 * 2. If token exists and is valid, attaches user info to request
 * 3. Proceeds to next middleware whether authenticated or not
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Token extraction from Authorization header if present
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            // Verify token using AuthService if token exists
            const user = await AuthService.verifyToken(token);

            if (user) {
                // Attach user to request if token is valid
                req.authUser = {
                    id: user._id,
                    email: user.email,
                    role: user.role
                };
            }
            // If token is invalid, we just proceed without authUser
        }

        // Always proceed to next middleware
        next();
    } catch (error) {
        console.error('Optional authentication error:', error);

        // Even if there's an error, we proceed to next middleware
        // since this is optional authentication
        next();
    }
};

/**
 * Authentication Middleware
 * 1. Extracts JWT token from headers
 * 2. Verifies the token
 * 3. Attaches user info to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Token extraction from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No authentication token found'
            });
            return;
        }

        // Verify token using AuthService
        const user = await AuthService.verifyToken(token);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }

        // Attach user to request
        req.authUser = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);

        let errorMessage = 'Authentication failed';
        if (error instanceof jwt.TokenExpiredError) {
            errorMessage = 'Token expired';
        } else if (error instanceof jwt.JsonWebTokenError) {
            errorMessage = 'Invalid token';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        res.status(401).json({
            success: false,
            message: errorMessage
        });
    }
};

/**
 * Role-specific middleware generator
 */
export const requireRole = (requiredRole: 'user' | 'admin') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.authUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.authUser.role !== requiredRole) {
            return res.status(403).json({
                success: false,
                message: `Requires ${requiredRole} role`
            });
        }

        next();
    };
};