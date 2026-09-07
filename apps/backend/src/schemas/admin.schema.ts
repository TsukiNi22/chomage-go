import {z} from "zod";

export const moderationSchema = z.object({
    action: z.enum(["suspend", "reactivate", "ban"]),
    reason: z.string().max(500).optional(),
});
