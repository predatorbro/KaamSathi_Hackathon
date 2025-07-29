export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    metadata?: {
        currentQuestion?: number;
        totalQuestions?: number;
        completionPercentage?: number;
        isCompleted?: boolean;
        threadId?: string;
        fileSize?: number;
        fileName?: string;
    };
}

export interface ResumeAnalysis {
    atsScore: number;
    improvements: string[];
    missingKeywords: string[];
    formattingIssues: string[];
    summary?: string;
}