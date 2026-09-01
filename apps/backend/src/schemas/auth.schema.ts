import {z} from "zod";

// exemple
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});



