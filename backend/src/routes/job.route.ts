// src/routes/job.routes.ts
import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { JobController } from '../controllers/job.controller';

const router = express.Router();

// Search jobs
router.get('/search', optionalAuthenticate, JobController.searchJobs);

// Get featured jobs
router.get('/featured', optionalAuthenticate, JobController.getFeaturedJobs);

// Get job details
router.get('/job/:id', optionalAuthenticate, JobController.getJobDetails);

// Get user's jobs (requires authentication)
router.get('/user/jobs', authenticate, JobController.getUserJobs);

// Bookmark/unbookmark a job (requires authentication)
router.post('/:jobId/bookmark', authenticate, JobController.bookmarkJob);

export const jobRoutes = router;