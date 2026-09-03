import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { API_URL } from "./env";

export const authClient = createAuthClient({
    baseURL: API_URL,
    plugins: [
        inferAdditionalFields({
            user: {
                rank: { type: "number", input: false },
                companiesId: { type: "number", required: false, input: false },
                firstname: { type: "string" },
                lastname: { type: "string" },
                emailContact: { type: "string", required: false },
                address: { type: "string", required: false },
                description: { type: "string", required: false },
                resume: { type: "string", required: false },
                localisation: { type: "boolean", required: false },
                allowedAt: { type: "date", required: false, input: false },
            },
        }),
    ],
});
