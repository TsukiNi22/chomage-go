import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Job Platform API",
            version: "1.0.0",
            description: "API documentation for the job platform backend",
        },
        servers: [
            { url: "/api", description: "API root" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "Token",
                }
            }
        }
    },
    apis: ["./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
