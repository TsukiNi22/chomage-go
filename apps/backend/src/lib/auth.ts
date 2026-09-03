import 'dotenv/config';
import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "../db/index.ts";
import * as schema from "../db/schema.ts";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { ...schema },
    }),
    user: {
        modelName: "users",
        additionalFields: {
            rank: { type: "number", required: true, defaultValue: 2, input: false },
            companiesId: { type: "number", required: false, fieldName: "companies_id", input: false },
            firstname: { type: "string", required: true },
            lastname: { type: "string", required: true },
            emailContact: { type: "string", required: false, fieldName: "email_contact" },
            address: { type: "string", required: false },
            description: { type: "string", required: false },
            resume: { type: "string", required: false },
            localisation: { type: "boolean", required: false },
            allowedAt: { type: "date", required: false, fieldName: "allowed_at", input: false },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 3, // 3 day
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 min
        },
        modelName: "session",
    },
    advanced: {
        database: {
            generateId: "serial",
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
});
