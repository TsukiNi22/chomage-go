import {migrate} from "drizzle-orm/postgres-js/migrator";
import {db, client} from "./index.ts";

async function main() {
    console.log("[migrate] applying migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[migrate] done");
    await client.end();
}

main().catch((err) => {
    console.error("[migrate] failed", err);
    process.exit(1);
});
