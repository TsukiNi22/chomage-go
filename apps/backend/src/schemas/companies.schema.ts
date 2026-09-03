import {z} from "zod";

export const postCompagnieSchema = z.object({
    name: z.string(),
    siret: z.string(),
    description: z.string().optional(),
    link: z.string().url().optional(),
    employee_range: z.number().int(),
});
export const patchCompagnieSchema = postCompagnieSchema.partial();
