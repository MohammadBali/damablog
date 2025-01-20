import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express';
import path from "path";

//Set the Swagger Options
const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Blog API',
            version: '1.0.0',
            description: 'API documentation for the blog system',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Replace with your server URL
                description: 'Local server'
            },
        ],
    },
    apis: ['./src/routers/*.ts'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger API Documentation
 * @param app The Express App, so we can Expose an API**/
export const setupSwagger = (app: Express): void => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
