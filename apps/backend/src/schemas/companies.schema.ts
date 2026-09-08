import {z} from "zod";

// Le nom, l'activité et l'adresse proviennent de l'API Sirene : ils ne sont pas acceptés du client.
export const postCompagnieSchema = z.object({
    siret: z.string().regex(/^[\d\s]{14,20}$/, "Le SIRET comporte 14 chiffres"),
    description: z.string().max(2000).optional(),
    link: z.string().url().optional(),
});

export const patchCompagnieSchema = z.object({
    description: z.string().max(2000).optional(),
    link: z.string().url().optional().or(z.literal("")),
});
