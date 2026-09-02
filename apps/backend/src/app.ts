import express, {Express} from "express";
import swaggerUi from "swagger-ui-express";
import {router} from "./routes";
import {errorHandler} from "./middlewares/errorHandler.middleware";
import {swaggerSpec} from "./config/swagger.config";

export function createApp(): Express
{
    const app = express();

    // Basic health check (run before other in case of problems)
    app.get("/health", (req, res) => {
        res.status(200).json({ status: "ok" });
    });

    // Setup each action/step for the API (REST)
    app.use(express.json()); // Auto parse the body has a json
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Documentation Swagger
    app.use("/api", router); // Link the router with the api
    app.use(errorHandler); // Always after everything (middleware)

    return app;
}
