import {z} from "zod";

export const postCompagnieSchema = z.object({
    name: z.string(),
    siret: z.string().regex(/^\d{14}$/, "Le SIRET comporte 14 chiffres"),
    description: z.string().optional(),
    link: z.string().url().optional(),
    employee_range: z.number().int(),
});
export const patchCompagnieSchema = postCompagnieSchema.partial();
