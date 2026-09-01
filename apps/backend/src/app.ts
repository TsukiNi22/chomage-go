import express, {Express} from "express";
import {router} from "./routes";
import {errorHandler} from "./middlewares/errorHandler.middleware";

export function createApp(): Express
{
  const app = express();

  // Auto parse the body has a json
  app.use(express.json());

  // Link the router with the api
  app.use("/api", router);

  // Always after everything (middleware)
  app.use(errorHandler);

  return app;
}
