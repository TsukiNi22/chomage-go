import {z} from "zod";

export const addressSchema = z.object({
    label: z.string().min(3),
    street: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});

export const postJobSchema = z.object({
    companies_id: z.number().int(),
    title: z.string(),
    description: z.string().optional(),
    type: z.number().int(),
    sector: z.string().max(100).optional(),
    remote: z.number().int().min(0).max(2).optional(),
    max_applicants: z.number().int().positive().optional(),
    address_id: z.number().int().optional(),
    address: addressSchema.optional(), // lieu propre à l'offre, à défaut celui de l'entreprise
    salary_min: z.number().int(),
    salary_max: z.number().int().optional(),
});
export const patchJobSchema = postJobSchema.partial();

export const postSkillSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});
export const patchSkillSchema = postSkillSchema.partial();
