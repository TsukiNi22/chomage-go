import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        // Les rendus d'e-mail lisent ces variables ; on les fige pour que les
        // assertions ne dependent pas du .env de la machine.
        env: {
            MAIL_FROM: "GeoEmploi <no-reply@geoemploi.fr>",
            FRONTEND_URL: "http://localhost:3000",
        },
    },
});
