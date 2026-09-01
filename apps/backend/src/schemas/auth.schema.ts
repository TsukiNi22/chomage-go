import {z} from "zod";

export const registerSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    email_contact: z.string().email().optional(),
    password: z.string().min(8),
    address: z.string().optional(),
    description: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
