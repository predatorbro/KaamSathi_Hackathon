// course.routes.ts
import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { CourseController } from '../controllers/course.controller';

const router = express.Router();

// Search courses
router.get('/search', optionalAuthenticate, CourseController.searchCourses);

router.get('/featured', optionalAuthenticate, CourseController.getFeaturedCourses);
// Get course details
router.get('/course/:id', optionalAuthenticate, CourseController.getCourseDetails);

// Get user's courses (requires authentication)
router.get('/user/courses', authenticate, CourseController.getUserCourses);

// Bookmark/unbookmark a course (requires authentication)
router.post('/:courseId/bookmark', authenticate, CourseController.bookmarkCourse);

// Get featured courses

export const courseRoutes = router;