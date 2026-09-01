import {Request, Response, NextFunction} from "express";
import {ZodSchema} from "zod";

export function validateJson(schema: ZodSchema, req: Request, res: Response): boolean
{
    const result = schema.safeParse(req.body);

    // Check zod success
    if (!result.success) {
        res.status(400).json({
            error: "Invalid request body",
            details: result.error.flatten(),
        });
        return false;
    }

    // Store the body parsed & cleaned
    req.body = result.data;

    return true;
}
