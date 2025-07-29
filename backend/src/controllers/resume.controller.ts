import { Request, Response } from 'express';
import { ApiResponse, ResumeAnalysis } from '../types/api.types';
import { resumeService } from '../services/resume.service';
import { handleFileUpload, fileUploadErrorHandler } from '../middleware/file-upload.middleware';

export const resumeController = {
    analyzeResume: [
        handleFileUpload,
        fileUploadErrorHandler,
        async (req: Request, res: Response<ApiResponse<ResumeAnalysis>>) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'No file uploaded'
                    });
                }

                // Extract text from PDF
                const resumeText = await resumeService.extractTextFromPDF(req.file.buffer);

                // Analyze with Gemini
                const analysis = await resumeService.analyzeResume(resumeText);

                return res.json({
                    success: true,
                    data: analysis,
                    metadata: {
                        fileSize: req.file.size,
                        fileName: req.file.originalname
                    }
                });
            } catch (error) {
                console.error('Resume analysis error:', error);
                return res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to analyze resume'
                });
            }
        }
    ]
};