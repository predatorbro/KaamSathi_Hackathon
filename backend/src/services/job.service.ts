// src/services/job.service.ts
import { AppDataSource } from '../data-source';
import { Job } from '../entities/job.entity';
import { ObjectId } from 'mongodb';
import { UserJob } from '../entities/user_jobs.entity';
import { TavilyClient } from './tavily-client.service';
import metascraper from "metascraper";
import metascraperImage from "metascraper-image";
import metascraperLogo from "metascraper-logo-favicon";
import metascraperDescription from "metascraper-description";
import axios from 'axios';

const jobRepository = AppDataSource.getMongoRepository(Job);
const userJobRepository = AppDataSource.getMongoRepository(UserJob);

// Configure metascraper
const metascraperInstance = metascraper([
    metascraperDescription(),
    metascraperImage(),
    metascraperLogo()
]);

export class JobService {
    private static readonly BATCH_SIZE = 15;
    private static readonly TAVILY_DOMAINS = [
        'linkedin.com',
        'indeed.com',
        'glassdoor.com',
        'monster.com',
        'careerbuilder.com',
        'angel.co',
        'remote.co'
    ];

    static async searchJobs(query: string, maxResults: number = this.BATCH_SIZE): Promise<Job[]> {
        try {
            // First try to find in database using text search
            const dbJobs = await jobRepository.find({
                where: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { skills: { $regex: query, $options: 'i' } },
                        { company: { $regex: query, $options: 'i' } }
                    ]
                },
                take: maxResults,
                order: { popularityScore: 'DESC' }
            });

            if (dbJobs.length >= maxResults) {
                return dbJobs.slice(0, maxResults);
            }

            // If not enough in DB, fetch from Tavily
            const tavilyJobs = await this.fetchJobsFromTavily(query, maxResults - dbJobs.length);

            // Save new jobs to DB
            const newJobs = await this.saveJobs(tavilyJobs);

            // Combine results
            const combinedJobs = [...dbJobs, ...newJobs].slice(0, maxResults);


            // Check for missing metadata and fetch in parallel
            await this.fillMissingMetadata(combinedJobs);
            return combinedJobs;
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to simple search if text index isn't available
            const fallbackJobs = await jobRepository.find({
                where: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                },
                take: maxResults,
                order: { popularityScore: 'DESC' }
            });

            // Check for missing metadata and fetch in parallel
            await this.fillMissingMetadata(fallbackJobs);
            return fallbackJobs;
        }
    }

    private static async fillMissingMetadata(jobs: Job[]): Promise<void> {
        const jobsNeedingMetadata = jobs.filter(job =>
            !job.companyLogo || !job.shortDescription
        );

        if (jobsNeedingMetadata.length === 0) return;


        try {
            // Process jobs in batches to avoid overwhelming the system
            const BATCH_SIZE = 5;
            const batches = [];

            for (let i = 0; i < jobsNeedingMetadata.length; i += BATCH_SIZE) {
                batches.push(jobsNeedingMetadata.slice(i, i + BATCH_SIZE));
            }

            for (const batch of batches) {
                const batchPromises = batch.map(job =>
                    this.processJobMetadata(job).catch(error => {
                        console.error(`Error processing job ${job._id}:`, error);
                        return null;
                    })
                );

                await Promise.all(batchPromises);
            }
        } catch (error) {
            console.error('Error in metadata fetching process:', error);
        }
    }
    private static async processJobMetadata(job: Job): Promise<void> {
        try {
            // Add timeout to metadata fetching
            const { imageUrl, shortDescription } = await Promise.race([
                this.fetchMetadata(job.url),
                new Promise<{ imageUrl: null, shortDescription: null }>((resolve) =>
                    setTimeout(() => resolve({ imageUrl: null, shortDescription: null }), 5000)
                )
            ]);

            const updates: Partial<Job> = {};
            if (imageUrl && !job.companyLogo) {
                updates.companyLogo = imageUrl;
            }
            if (shortDescription && !job.shortDescription) {
                updates.shortDescription = shortDescription;
            }

            if (Object.keys(updates).length > 0) {
                await jobRepository.update(
                    { _id: job._id },
                    updates
                );
                Object.assign(job, updates);
            }
        } catch (error) {
            console.error(`Error processing metadata for job ${job._id}:`, error);
            throw error;
        }
    }

    private static async fetchMetadata(url: string): Promise<{ imageUrl: string | null, shortDescription: string | null }> {
        try {
            const response = await axios.get(url, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                },
                validateStatus: (status) => status >= 200 && status < 500
            });

            if (!response.data || typeof response.data !== 'string') {
                throw new Error('Invalid response data');
            }

            const metadata = await metascraperInstance({ html: response.data, url });

            return {
                imageUrl: metadata.image || metadata.logo || null,
                shortDescription: metadata.description || null
            };
        } catch (error) {
            console.error(`Error fetching metadata for ${url}:`, error);
            return {
                imageUrl: null,
                shortDescription: null
            };
        }
    }

    private static async fetchJobsFromTavily(query: string, count: number): Promise<Partial<Job>[]> {
        const tavily = new TavilyClient();
        try {
            const results = await tavily.search({
                query: `${query} jobs OR careers OR hiring`,
                include_raw_content: false,
                max_results: count,
                include_domains: this.TAVILY_DOMAINS
            });
            return results.results.map((item: { url: string; title: string; content: string | undefined; image: string; score: number }) => {
                const company = this.extractCompanyFromTitle(item.title);
                const isRemote = this.isJobRemote(item.title, item.content || '');

                return {
                    tavilyId: this.generateTavilyId(item.url),
                    title: item.title,
                    description: item.content || '',
                    shortDescription: '', // Will be filled later
                    company,
                    companyLogo: item.image || null,
                    url: item.url,
                    skills: this.extractSkills(item.content || ''),
                    location: this.extractLocation(item.title, item.content || ''),
                    isRemote,
                    tavilyScore: item.score || 0,
                    postedDate: new Date() // Default to current date
                };
            });
        } catch (error) {
            console.error('Error fetching from Tavily:', error);
            return [];
        }
    }

    private static async saveJobs(jobs: Partial<Job>[]): Promise<Job[]> {
        const savedJobs: Job[] = [];

        for (const jobData of jobs) {
            // Check if job already exists
            const existingJob = await jobRepository.findOne({
                where: { tavilyId: jobData.tavilyId }
            });

            if (existingJob) {
                savedJobs.push(existingJob);
                continue;
            }

            // Create new job
            const job = new Job();
            Object.assign(job, jobData);
            const savedJob = await jobRepository.save(job);
            savedJobs.push(savedJob);
        }

        return savedJobs;
    }

    private static extractCompanyFromTitle(title: string): string {
        // Try to extract company from title patterns like "Job Title at Company"
        const patterns = [
            /at\s+(.+)$/i,
            /\bat\b(.+)$/i,
            /-\s*(.+)$/i
        ];

        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return 'Unknown Company';
    }

    private static isJobRemote(title: string, description: string): boolean {
        const remoteKeywords = ['remote', 'work from home', 'wfh', 'virtual'];
        const combinedText = `${title} ${description}`.toLowerCase();
        return remoteKeywords.some(keyword => combinedText.includes(keyword));
    }

    private static extractSkills(description: string): string[] {
        if (!description) return [];

        // Common tech skills to look for
        const techSkills = [
            'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js',
            'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Ruby', 'PHP',
            'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Docker', 'Kubernetes',
            'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'REST API', 'GraphQL',
            'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch'
        ];

        const foundSkills: string[] = [];
        const descriptionLower = description.toLowerCase();

        for (const skill of techSkills) {
            if (descriptionLower.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        }

        return foundSkills;
    }

    private static extractLocation(title: string, description: string): string {
        // Try to extract location from common patterns
        const patterns = [
            /in\s+([A-Za-z\s,]+)/i,
            /@\s+([A-Za-z\s,]+)/i,
            /,\s*([A-Za-z\s]+)$/i
        ];

        // Check title first
        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }

        // Then check description
        for (const pattern of patterns) {
            const match = description.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }

        return 'Location not specified';
    }

    private static generateTavilyId(url: string): string {
        return Buffer.from(url).toString('base64');
    }

    static async getJobById(id: ObjectId): Promise<Job | null> {
        return await jobRepository.findOne({ where: { _id: id } });
    }

    static async getJobsByIds(ids: ObjectId[]): Promise<Job[]> {
        return await jobRepository.find({
            where: { _id: { $in: ids } }
        });
    }

    static async getUserJobs(userId: ObjectId): Promise<{ job: Job; userJob: UserJob }[]> {
        const userJobs = await userJobRepository.find({
            where: { userId },
            order: { lastAccessed: 'DESC' }
        });

        const jobIds = userJobs.map(uj => uj.jobId);
        const jobs = await this.getJobsByIds(jobIds);

        return userJobs.map(userJob => {
            const job = jobs.find(j => j._id.equals(userJob.jobId))!;
            return { job, userJob };
        });
    }

    static async bookmarkJob(userId: ObjectId, jobId: ObjectId, bookmark: boolean): Promise<void> {
        let userJob = await userJobRepository.findOne({
            where: { userId, jobId }
        });

        if (!userJob) {
            userJob = new UserJob();
            userJob.userId = userId;
            userJob.jobId = jobId;
        }

        userJob.isBookmarked = bookmark;
        await userJobRepository.save(userJob);

        // Update popularity score
        await jobRepository.updateOne(
            { _id: jobId },
            { $inc: { popularityScore: bookmark ? 1 : -1 } }
        );
    }

    static async getFeaturedJobs(limit: number = 15): Promise<Job[]> {
        return await jobRepository.find({
            take: limit,
            order: {
                tavilyScore: 'DESC',
                popularityScore: 'DESC'
            }
        });
    }

    static async batchCreateJobs(jobsData: Partial<Job>[]): Promise<Job[]> {
        const jobs = jobsData.map(data => {
            const job = new Job();
            Object.assign(job, data);
            return job;
        });

        return await jobRepository.save(jobs);
    }
}