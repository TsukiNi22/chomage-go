import {z} from "zod";

export const postJobSchema = z.object({
    companies_id: z.number().int(),
    title: z.string(),
    description: z.string().optional(),
    type: z.number().int(),
    salary_min: z.number().int(),
    salary_max: z.number().int().optional(),
});
export const patchJobSchema = postJobSchema.partial();

export const postSkillSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});
export const patchSkillSchema = postSkillSchema.partial();
