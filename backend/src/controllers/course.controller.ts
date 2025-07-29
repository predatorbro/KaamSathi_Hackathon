import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { ObjectId } from 'mongodb';

interface CourseResponse {
    id: ObjectId;
    title: string;
    description: string;
    shortDescription: string;
    provider: string;
    url: string;
    categories: string[];
    isFree: boolean;
    imageUrl?: string;
    isBookmarked?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export class CourseController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static async enhanceCourseResponse(course: any, userId?: ObjectId): Promise<CourseResponse> {
        const response: CourseResponse = {
            id: course._id,
            title: course.title,
            description: course.description,
            shortDescription: course.shortDescription,
            provider: course.provider,
            url: course.url,
            categories: course.categories,
            isFree: course.isFree,
            imageUrl: course.imageUrl
        };

        if (userId) {
            const userCourses = await CourseService.getUserCourses(userId);
            const userCourse = userCourses.find(uc => uc.course._id.equals(course._id));
            response.isBookmarked = userCourse?.userCourse.isBookmarked || false;
        }

        return response;
    }

    static async searchCourses(req: Request, res: Response<ApiResponse<CourseResponse[]>>): Promise<Response> {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const courses = await CourseService.searchCourses(query);
            const userId = req.authUser?.id;

            const enhancedCourses = await Promise.all(
                courses.map(course => CourseController.enhanceCourseResponse(course, userId))
            );

            return res.json({
                success: true,
                data: enhancedCourses
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Search failed';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }

    static async getCourseDetails(req: Request, res: Response<ApiResponse<CourseResponse>>): Promise<Response> {
        try {
            const { id } = req.params;
            const userId = req.authUser?.id;

            const course = await CourseService.getCourseById(new ObjectId(id));
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            const response = await CourseController.enhanceCourseResponse(course, userId);

            return res.json({
                success: true,
                data: response
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to get course details';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }

    static async getUserCourses(req: Request, res: Response<ApiResponse<CourseResponse[]>>): Promise<Response> {
        if (!req.authUser) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        try {
            const userCourses = await CourseService.getUserCourses(req.authUser.id);
            const response = userCourses.map(({ course, userCourse }) => ({
                id: course._id,
                title: course.title,
                description: course.description,
                shortDescription: course.shortDescription,
                provider: course.provider,
                url: course.url,
                imageUrl: course.imageUrl,
                categories: course.categories,
                isFree: course.isFree,
                isBookmarked: userCourse.isBookmarked
            }));

            return res.json({
                success: true,
                data: response
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to get user courses';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }

    static async bookmarkCourse(req: Request, res: Response<ApiResponse<{ isBookmarked: boolean }>>): Promise<Response> {
        if (!req.authUser) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        try {
            const { courseId } = req.params;
            const { bookmark } = req.body;

            if (typeof bookmark !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'Bookmark status must be a boolean'
                });
            }

            await CourseService.bookmarkCourse(
                req.authUser.id,
                new ObjectId(courseId),
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

    static async getFeaturedCourses(req: Request, res: Response<ApiResponse<CourseResponse[]>>): Promise<Response> {
        try {
            const courses = await CourseService.getFeaturedCourses();
            const userId = req.authUser?.id;

            const enhancedCourses = await Promise.all(
                courses.map(course => CourseController.enhanceCourseResponse(course, userId))
            );

            return res.json({
                success: true,
                data: enhancedCourses
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to get featured courses';
            return res.status(500).json({
                success: false,
                message
            });
        }
    }
}