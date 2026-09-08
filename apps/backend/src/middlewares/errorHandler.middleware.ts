import {Request, Response, NextFunction} from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction)
{
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const body: Record<string, unknown> = { error: message };
  if (err.details && typeof err.details === "object") {
      Object.assign(body, err.details);
  }

  res.status(status).json(body);
}
