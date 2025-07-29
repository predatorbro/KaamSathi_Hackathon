import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';

const storage = multer.memoryStorage(); // Store file in memory instead of disk

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const handleFileUpload = upload.single('resume');

export const fileUploadErrorHandler = (err: unknown, req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE'
                ? 'File size exceeds 5MB limit'
                : 'File upload error'
        });
    } else if (err instanceof Error) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};