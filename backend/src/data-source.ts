import { DataSource } from "typeorm";
import path from "path";
import { ENV } from './constants/env.constants';

// Determine if the environment is production
const isProduction = process.env.NODE_ENV === "production";

// Resolve the correct file extension and directory based on the environment
const entitiesPath = isProduction
    ? path.join(__dirname, "entities", "*.js") // Use compiled JS files in production
    : path.join(__dirname, "entities", "*.ts"); // Use TS files in development

export const AppDataSource = new DataSource({
    type: "mongodb",
    url: ENV.DB_URL || "mongodb://localhost:27017/my_database",
    synchronize: ENV.DB_SYNCHRONIZE === "true",
    logging: false,
    entities: [entitiesPath], // Dynamically set entity paths
    // Note: Migrations are not typically used in MongoDB with TypeORM
});