import { AppDataSource } from '../data-source';
import { Course } from '../entities/course.entity';
import { ObjectId } from 'mongodb';
import { UserCourse } from '../entities/user_courses.entity';
import { TavilyClient } from './tavily-client.service';
import metascraper from "metascraper";
import metascraperImage from "metascraper-image";
import metascraperLogo from "metascraper-logo-favicon";
import metascraperDescription from "metascraper-description";
import axios from 'axios';

const courseRepository = AppDataSource.getMongoRepository(Course);
const userCourseRepository = AppDataSource.getMongoRepository(UserCourse);

// Configure metascraper
const metascraperInstance = metascraper([
    metascraperDescription(),
    metascraperImage(),
    metascraperLogo()
]);

export class CourseService {
    private static readonly BATCH_SIZE = 15;
    private static readonly TAVILY_DOMAINS = [
        'coursera.org',
        'udemy.com',
        'edx.org',
        'youtube.com',
        'youtu.be'
    ];

    static async searchCourses(query: string, maxResults: number = this.BATCH_SIZE): Promise<Course[]> {
        try {
            // First try to find in database using text search
            const dbCourses = await courseRepository.find({
                where: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { categories: { $regex: query, $options: 'i' } }
                    ]
                },
                take: maxResults,
                order: { popularityScore: 'DESC' }
            });

            if (dbCourses.length >= maxResults) {
                return dbCourses.slice(0, maxResults);
            }

            // If not enough in DB, fetch from Tavily
            const tavilyCourses = await this.fetchCoursesFromTavily(query, maxResults - dbCourses.length);

            // Save new courses to DB
            const newCourses = await this.saveCourses(tavilyCourses);

            // Combine results
            const combinedCourses = [...dbCourses, ...newCourses].slice(0, maxResults);

            // Check for missing metadata and fetch in parallel
            await this.fillMissingMetadata(combinedCourses);

            return combinedCourses;
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to simple search if text index isn't available
            const fallbackCourses = await courseRepository.find({
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
            await this.fillMissingMetadata(fallbackCourses);
            return fallbackCourses;
        }
    }

    private static async fillMissingMetadata(courses: Course[]): Promise<void> {
        const coursesNeedingMetadata = courses.filter(course =>
            !course.imageUrl || !course.shortDescription
        );

        if (coursesNeedingMetadata.length === 0) return;

        try {
            const metadataPromises = coursesNeedingMetadata.map(async (course) => {
                try {
                    const { imageUrl, shortDescription } = await this.fetchMetadata(course.url);

                    const updates: Partial<Course> = {};
                    if (imageUrl && !course.imageUrl) {
                        updates.imageUrl = imageUrl;
                    }
                    if (shortDescription && !course.shortDescription) {
                        updates.shortDescription = shortDescription;
                    }

                    if (Object.keys(updates).length > 0) {
                        await courseRepository.update(
                            { _id: course._id },
                            updates
                        );
                        Object.assign(course, updates);
                    }
                } catch (error) {
                    console.error(`Error fetching metadata for course ${course._id}:`, error);
                }
            });

            await Promise.all(metadataPromises);
        } catch (error) {
            console.error('Error in parallel metadata fetching:', error);
        }
    }
    // Update the fetchOpenGraphImage method to also get short description
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
    private static async fetchCoursesFromTavily(query: string, count: number): Promise<Partial<Course>[]> {
        const tavily = new TavilyClient();
        try {
            const results = await tavily.search({
                query: `${query} online courses OR tutorials`,
                include_raw_content: false,
                max_results: count,
                include_domains: this.TAVILY_DOMAINS
            });

            return results.results.map((item: { url: string; title: string; content: string | undefined; image: string; score: number }) => {
                const provider = this.determineProvider(item.url);
                const isYouTube = provider === 'YouTube';
                return {
                    tavilyId: this.generateTavilyId(item.url),
                    title: item.title,
                    description: item.content || '',
                    shortDescription: '', // Will be filled later
                    provider,
                    url: item.url,
                    imageUrl: item.image || null,
                    categories: [query.toLowerCase()],
                    isFree: isYouTube ? true : this.isCourseFree(item.url, provider),
                    isVideo: isYouTube,
                    tavilyScore: item.score || 0 // Store the Tavily score
                };
            });
        } catch (error) {
            console.error('Error fetching from Tavily:', error);
            return [];
        }
    }


    private static async saveCourses(courses: Partial<Course>[]): Promise<Course[]> {
        const savedCourses: Course[] = [];

        for (const courseData of courses) {
            // Check if course already exists
            const existingCourse = await courseRepository.findOne({
                where: { tavilyId: courseData.tavilyId }
            });

            if (existingCourse) {
                savedCourses.push(existingCourse);
                continue;
            }

            // Create new course
            const course = new Course();
            Object.assign(course, courseData);
            const savedCourse = await courseRepository.save(course);
            savedCourses.push(savedCourse);
        }

        return savedCourses;
    }

    private static determineProvider(url: string): string {
        if (url.includes('coursera.org')) return 'Coursera';
        if (url.includes('udemy.com')) return 'Udemy';
        if (url.includes('edx.org')) return 'edX';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
        return 'Other';
    }

    private static isCourseFree(url: string, provider: string): boolean {
        // Simple heuristic - can be enhanced
        if (provider === 'Coursera') return url.includes('audit');
        if (provider === 'edX') return url.includes('course');
        return false; // Udemy courses are rarely free
    }

    private static generateTavilyId(url: string): string {
        return Buffer.from(url).toString('base64');
    }

    private static extractYouTubeDuration(description?: string): string | null {
        if (!description) return null;

        try {
            // Try multiple patterns to extract duration
            const patterns = [
                /(\d+:\d+:\d+)/,    // HH:MM:SS
                /(\d+:\d+)/,         // MM:SS
                /(\d+\s*h(?:ours?)?\s*\d+\s*m(?:inutes?)?)/i,  // 1 hour 30 minutes
                /(\d+\s*m(?:inutes?)?)/i                        // 30 minutes
            ];

            for (const pattern of patterns) {
                const match = description.match(pattern);
                if (match) {
                    return match[0];
                }
            }
            return null;
        } catch (error) {
            console.error('Error extracting YouTube duration:', error);
            return null;
        }
    }


    static async getCourseById(id: ObjectId): Promise<Course | null> {
        return await courseRepository.findOne({ where: { _id: id } });
    }

    static async getCoursesByIds(ids: ObjectId[]): Promise<Course[]> {
        return await courseRepository.find({
            where: { _id: { $in: ids } }
        });
    }

    static async getUserCourses(userId: ObjectId): Promise<{ course: Course; userCourse: UserCourse }[]> {
        const userCourses = await userCourseRepository.find({
            where: { userId },
            order: { lastAccessed: 'DESC' }
        });

        const courseIds = userCourses.map(uc => uc.courseId);
        const courses = await this.getCoursesByIds(courseIds);

        return userCourses.map(userCourse => {
            const course = courses.find(c => c._id.equals(userCourse.courseId))!;
            return { course, userCourse };
        });
    }

    static async bookmarkCourse(userId: ObjectId, courseId: ObjectId, bookmark: boolean): Promise<void> {
        let userCourse = await userCourseRepository.findOne({
            where: { userId, courseId }
        });

        if (!userCourse) {
            userCourse = new UserCourse();
            userCourse.userId = userId;
            userCourse.courseId = courseId;
        }

        userCourse.isBookmarked = bookmark;
        await userCourseRepository.save(userCourse);

        // Update popularity score
        await courseRepository.updateOne(
            { _id: courseId },
            { $inc: { popularityScore: bookmark ? 1 : -1 } }
        );
    }

    static async getFeaturedCourses(limit: number = 15): Promise<Course[]> {
        return await courseRepository.find({
            take: limit,
            order: {
                tavilyScore: 'DESC',
                popularityScore: 'DESC'
            }
        });
    }
    static async batchCreateCourses(coursesData: Partial<Course>[]): Promise<Course[]> {
        const courses = coursesData.map(data => {
            const course = new Course();
            Object.assign(course, data);
            return course;
        });

        return await courseRepository.save(courses);
    }
}