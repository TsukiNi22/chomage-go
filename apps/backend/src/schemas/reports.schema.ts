import {z} from "zod";

export const REPORT_REASONS = [
    "offre-frauduleuse",
    "contenu-discriminatoire",
    "contenu-inapproprie",
    "usurpation",
    "spam",
    "autre",
] as const;

export const postReportSchema = z.object({
    job_id: z.number().int().optional(),
    user_id: z.number().int().optional(),
    reason: z.enum(REPORT_REASONS),
    description: z.string().max(1000).optional(),
});

export const patchReportSchema = z.object({
    status: z.number().int().min(0).max(2),
});
