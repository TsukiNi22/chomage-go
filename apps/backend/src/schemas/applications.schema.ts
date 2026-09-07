import {z} from "zod";

export const postApplicationSchema = z.object({
    job_id: z.number().int(),
    description: z.string().optional(),
});

export const patchApplicationSchema = z.object({
    status: z.number().int().min(0).max(2),
});
