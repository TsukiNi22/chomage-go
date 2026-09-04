import {defineConfig} from "drizzle-kit";

const url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.PORT_DB}/${process.env.DB_NAME}`;

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: url,
    },
});
