import dotenv from "dotenv";

dotenv.config();

// Define a type for the ENV object
type EnvConfig = {
    DB_URL: string;
    DB_SYNCHRONIZE: string;
    JWT_SECRET: string;
    TAVILY_API_KEY: string;
};

// Export the ENV object with default values
export const ENV: EnvConfig = {
    DB_URL: process.env.DB_URL || "mongodb://localhost:27017/my_database",
    DB_SYNCHRONIZE: process.env.DB_SYNCHRONIZE || "false",
    JWT_SECRET: process.env.JWT_SECRET || "your-default-secret-key",
    TAVILY_API_KEY: process.env.TAVILY_API_KEY || "your-default-tavily-api-key"

};