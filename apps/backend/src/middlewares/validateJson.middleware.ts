import {Request, Response, NextFunction} from "express";
import {ZodSchema} from "zod";

export function validateJson(schema: ZodSchema)
{
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    // Check zod success
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: result.error.flatten(),
      });
    }

    // Store the body parsed & cleaned
    req.body = result.data;

    next();
  };
}
