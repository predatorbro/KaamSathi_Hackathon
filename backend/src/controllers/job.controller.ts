// src/controllers/job.controller.ts
import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import { ObjectId } from 'mongodb';

interface JobResponse {
    id: ObjectId;
    title: string;
    description: string;
    shortDescription: string;
    company: string;
    companyLogo?: string;
    location: string;
    url: string;
    skills: string[];
    salary?: string;
    employmentType?: string;
    isRemote: boolean;
    postedDate?: Date;
    isBookmarked?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export class JobController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static async enhanceJobResponse(job: any, userId?: ObjectId): Promise<JobResponse> {
        const response: JobResponse = {
            id: job._id,
            title: job.title,
            description: job.description,
            shortDescription: job.shortDescription,
            company: job.company,
            companyLogo: job.companyLogo,
            location: job.location,
            url: job.url,
            skills: job.skills,
            salary: job.salary,
            employmentType: job.employmentType,
            isRemote: job.isRemote,
            postedDate: job.postedDate
        };

        if (userId) {
            const userJobs = await JobService.getUserJobs(userId);
            const userJob = userJobs.find(uj => uj.job._id.equals(job._id));
            response.isBookmarked = userJob?.userJob.isBookmarked || false;
        }

        return response;
    }

    static async searchJobs(req: Request, res: Response<ApiResponse<JobResponse[]>>): Promise<Response> {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const jobs = await JobService.searchJobs(query);
            const userId = req.authUser?.id;

            const enhancedJobs = await Promise.all(
                jobs.map(job => JobController.enhanceJobResponse(job, userId))
            );

            return res.json({
                success: true,
                data: enhancedJobs
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Search failed';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }

    static async getJobDetails(req: Request, res: Response<ApiResponse<JobResponse>>): Promise<Response> {
        try {
            const { id } = req.params;
            const userId = req.authUser?.id;

            const job = await JobService.getJobById(new ObjectId(id));
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            const response = await JobController.enhanceJobResponse(job, userId);

            return res.json({
                success: true,
                data: response
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to get job details';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }

    static async getUserJobs(req: Request, res: Response<ApiResponse<JobResponse[]>>): Promise<Response> {
        if (!req.authUser) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        try {
            const userJobs = await JobService.getUserJobs(req.authUser.id);
            const response = userJobs.map(({ job, userJob }) => ({
                id: job._id,
                title: job.title,
                description: job.description,
                shortDescription: job.shortDescription,
                company: job.company,
                companyLogo: job.companyLogo,
                location: job.location,
                url: job.url,
                skills: job.skills,
                salary: job.salary,
                employmentType: job.employmentType,
                isRemote: job.isRemote,
                postedDate: job.postedDate,
                isBookmarked: userJob.isBookmarked
            }));

            return res.json({
                success: true,
                data: response
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to get user jobs';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }

    static async bookmarkJob(req: Request, res: Response<ApiResponse<{ isBookmarked: boolean }>>): Promise<Response> {
        if (!req.authUser) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        try {
            const { jobId } = req.params;
            const { bookmark } = req.body;

            if (typeof bookmark !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'Bookmark status must be a boolean'
                });
            }

            await JobService.bookmarkJob(
                req.authUser.id,
                new ObjectId(jobId),
                bookmark
            );

            return res.json({
                success: true,
                data: { isBookmarked: bookmark }
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to update bookmark';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }

    static async getFeaturedJobs(req: Request, res: Response<ApiResponse<JobResponse[]>>): Promise<Response> {
        try {
            const jobs = await JobService.getFeaturedJobs();
            const userId = req.authUser?.id;

            const enhancedJobs = await Promise.all(
                jobs.map(job => JobController.enhanceJobResponse(job, userId))
            );

            return res.json({
                success: true,
                data: enhancedJobs
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to get featured jobs';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }
}