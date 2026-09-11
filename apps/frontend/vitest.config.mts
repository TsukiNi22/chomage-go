import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";

export default defineConfig({
    resolve: {
        // Meme alias que tsconfig.json : "@/lib/api" -> "<app>/lib/api".
        alias: {
            "@": fileURLToPath(new URL("./", import.meta.url)),
        },
    },
    test: {
        environment: "node",
        include: ["lib/**/*.test.ts"],
        env: {
            // lib/env.ts leve au chargement si cette variable manque.
            NEXT_PUBLIC_API_URL: "http://localhost:4000",
            // Vide : apiBase() doit retomber sur NEXT_PUBLIC_API_URL, quel que
            // soit le .env de la machine qui lance les tests.
            BACKEND_URL: "",
        },
    },
});
