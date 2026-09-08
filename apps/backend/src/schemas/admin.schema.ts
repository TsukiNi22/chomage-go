import {z} from "zod";

export const moderationSchema = z.object({
    action: z.enum(["suspend", "reactivate", "ban"]),
    reason: z.string().max(500).optional(),
});

export const rankSchema = z.object({
    rank: z.number().int().min(0).max(2),
});

export const reportStatusSchema = z.object({
    status: z.number().int().min(0).max(2),
});
