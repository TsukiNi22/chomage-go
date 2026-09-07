import {z} from "zod";

export const postApplicationSchema = z.object({
    job_id: z.number().int(),
    description: z.string().optional(),
});
