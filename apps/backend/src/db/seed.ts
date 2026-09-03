import {auth} from "../lib/auth.ts";
import {db, client} from "./index.ts";
import {users, companies} from "./schema.ts";
import {eq} from "drizzle-orm";

const DEMO_PASSWORD = "demo1234";

async function ensureUser(
    email: string, name: string, firstname: string, lastname: string,
    rank: number, companiesId?: number)
{
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
        console.log(`[seed] ${email} already exists, skipping`);
        return;
    }
    const { user } = await auth.api.signUpEmail({ body: { email, password: DEMO_PASSWORD, name, firstname, lastname } });
    await db.update(users)
        .set({ rank, firstname, lastname, companiesId, emailVerified: true, allowedAt: new Date() })
        .where(eq(users.id, Number(user.id)));
    console.log(`[seed] created ${email} (rank ${rank})`);
}

async function main()
{
    const existingCompany = await db.query.companies.findFirst({ where: eq(companies.siret, "12345678900011") });
    const companyId = existingCompany?.id ?? (await db.insert(companies).values({
        name: "Acme Corp",
        siret: "12345678900011",
        description: "Entreprise de démonstration",
        link: "https://acme.example",
        employeeRange: 1,
    }).returning())[0].id;

    await ensureUser("admin@demo.local", "Admin Demo", "Admin", "Demo", 0);
    await ensureUser("employer@demo.local", "Employeur Demo", "Employeur", "Demo", 1, companyId);
    await ensureUser("candidate@demo.local", "Candidat Demo", "Candidat", "Demo", 2);

    console.log("[seed] done");
    await client.end();
}

main().catch((err) => {
    console.error("[seed] failed", err);
    process.exit(1);
});
