import 'dotenv/config';
import {eq} from "drizzle-orm";
import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "../db/index.ts";
import * as schema from "../db/schema.ts";
import {sendVerificationMail} from "../utils/notify.utils.ts";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { ...schema },
    }),
    user: {
        modelName: "users",
        // `returned: false` garde le champ modifiable mais l'exclut de la charge utile
        // de session. Le cache de session vit dans un cookie : un CV en base64 y ferait
        // exploser la limite des 4 ko et désactiverait le cache. Ces champs sont lus
        // via GET /api/users, jamais depuis la session.
        additionalFields: {
            rank: { type: "number", required: true, defaultValue: 2, input: false },
            companiesId: {
                type: "number",
                required: false,
                fieldName: "companies_id",
                input: false,
                returned: false,
            },
            firstname: { type: "string", required: true },
            lastname: { type: "string", required: true },
            emailContact: {
                type: "string",
                required: false,
                fieldName: "email_contact",
                returned: false,
            },
            address: { type: "string", required: false, returned: false },
            description: { type: "string", required: false, returned: false },
            resume: { type: "string", required: false, returned: false },
            localisation: { type: "boolean", required: false },
            allowedAt: {
                type: "date",
                required: false,
                fieldName: "allowed_at",
                input: false,
                returned: false,
            },
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
        // Le compte reste utilisable sans vérification : l'adresse non confirmée est
        // simplement signalée dans le profil, avec un renvoi possible du message.
        requireEmailVerification: false,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        expiresIn: 60 * 60, // 1 heure
        sendVerificationEmail: async ({user, token}) => {
            // On reconstruit le lien pour renvoyer l'utilisateur sur le front une fois vérifié,
            // le callback par défaut pointant sur l'API.
            const api = process.env.BETTER_AUTH_URL || "http://localhost:4000";
            const front = process.env.FRONTEND_URL || "http://localhost:3000";
            const url = `${api}/api/auth/verify-email?token=${token}` +
                `&callbackURL=${encodeURIComponent(front + "/profil?verifie=1")}`;

            await sendVerificationMail(user.email, { name: user.name, url: url });
        },
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
    databaseHooks: {
        session: {
            create: {
                after: async (session) => {
                    await db
                        .update(schema.users)
                        .set({ lastLoginAt: new Date() })
                        .where(eq(schema.users.id, Number(session.userId)));
                },
            },
        },
    },
});
