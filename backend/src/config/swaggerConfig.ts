import { Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "KaamSathi App API",
            version: "1.0.0",
            description: "API documentation for the KaamSathi platform — helping users find skilled workers easily.",
        },
        servers: [
            {
                url: "http://localhost:5000/api", // Change to your deployed API URL in prod
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: isProduction ? ["dist/routes/**/*.js"] : ["src/routes/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: express.Application) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.get("/api-docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log("Swagger docs available at /api-docs");
};
