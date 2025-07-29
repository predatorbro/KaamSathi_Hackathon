import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerDocs } from "./config/swaggerConfig";
import { authRoutes } from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import { AppDataSource } from "./data-source";
import { aiQuizRoutes } from "./routes/ai-quiz.routes";
import { aiChatbotRoutes } from "./routes/ai-chatbot.route";
import { resumeRoutes } from "./routes/resume.route";
import { courseRoutes } from "./routes/course.route";
import { jobRoutes } from "./routes/job.route";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/ai-quiz', aiQuizRoutes);
app.use("/api/ai-chatbot", aiChatbotRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/jobs", jobRoutes); // Import job routes


// Error handling (must be after routes)
app.use(errorHandler);

// Swagger
swaggerDocs(app);


// Start the server
const PORT = process.env.PORT || 3000;

// Initialize App
const startServer = async () => {
    try {
        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);

            // Connect to DB in background
            AppDataSource.initialize()
                .then(() => console.log('Database connected'))
                .catch(console.error);
        });

        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                AppDataSource.destroy().then(() => {
                    console.log('Server and DB connections closed');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();