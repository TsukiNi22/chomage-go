import {z} from "zod";

export const patchUserSchema = z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    email_contact: z.string().email().optional(),
    address: z.string().optional(),
    description: z.string().optional(),
    resume: z.string().optional(),
    localisation: z.boolean().optional(),
});

export const postSkillSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});
export const patchSkillSchema = postSkillSchema.partial();

export const postExperienceSchema = z.object({
    companies_id: z.number().int().optional(),
    name: z.string(),
    description: z.string().optional(),
    type: z.number().int(),
    part_time: z.boolean(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
});
export const patchExperienceSchema = postExperienceSchema.partial();

export const postAvailabilitySchema = z.object({
    title: z.string().optional(),
    type: z.number().int(),
    part_time: z.boolean(),
    start: z.string().datetime(),
    end: z.string().datetime().optional(),
});
export const patchAvailabilitySchema = postAvailabilitySchema.partial();
