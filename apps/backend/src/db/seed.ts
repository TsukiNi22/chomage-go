import {auth} from "../lib/auth.ts";
import {db, client} from "./index.ts";
import {users, companies, addresses, jobs} from "./schema.ts";
import {eq} from "drizzle-orm";
import jobsData from "./jobs.seed.json" with {type: "json"};

const DEMO_PASSWORD = "demo1234";

const CONTRACT_TYPES: Record<string, number> = {
    "CDI": 0,
    "CDD": 1,
    "Alternance": 2,
    "Stage": 3,
    "Freelance": 4,
};

const REMOTE_LEVELS: Record<string, number> = {
    "Aucun": 0,
    "Partiel": 1,
    "Total": 2,
};

type SeedJob = {
    title: string;
    company: string;
    sector: string;
    contract: string;
    city: string;
    postalCode: string;
    address: string;
    lat: number;
    lon: number;
    lambertX: number | null;
    lambertY: number | null;
    geocodingSource: string | null;
    geocodingScore: number | null;
    geocodedAt: string | null;
    needsLocationCheck: boolean;
    salaryMin: number;
    salaryMax: number | null;
    remote: string;
    publishedAt: string;
    description: string;
};

function fakeSiret(name: string): string
{
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % 100000000000000;
    }
    return String(hash).padStart(14, "0");
}

async function seedJobs(posterId: number)
{
    const existing = await db.query.jobs.findFirst();
    if (existing) {
        console.log("[seed] jobs already present, skipping");
        return;
    }

    const list = jobsData as SeedJob[];
    const companyIds = new Map<string, number>();
    const seen = new Set<string>();
    let created = 0;
    let skipped = 0;

    for (const item of list) {
        // Une offre est identifiée par son intitulé au sein d'une entreprise
        // (contrainte unique en base) : le jeu de démonstration contient quelques
        // doublons, on les écarte avant l'insertion plutôt qu'en rattrapant l'erreur.
        const key = item.company + "\u0000" + item.title;
        if (seen.has(key)) {
            console.log(`[seed] doublon ignore : "${item.title}" chez ${item.company}`);
            skipped++;
            continue;
        }
        seen.add(key);

        let companyId = companyIds.get(item.company);

        if (companyId === undefined) {
            const siret = fakeSiret(item.company);
            const found = await db.query.companies.findFirst({
                where: eq(companies.siret, siret),
            });

            if (found) {
                companyId = found.id;
            } else {
                const [row] = await db.insert(companies).values({
                    name: item.company,
                    siret: siret,
                    employeeRange: 1,
                }).returning();
                companyId = row.id;
            }

            companyIds.set(item.company, companyId);
        }

        let geocodedAt = null;
        if (item.geocodedAt !== null) {
            geocodedAt = new Date(item.geocodedAt);
        }

        const [address] = await db.insert(addresses).values({
            label: item.address + ", " + item.postalCode + " " + item.city,
            street: item.address,
            postalCode: item.postalCode,
            city: item.city,
            latitude: item.lat,
            longitude: item.lon,
            lambertX: item.lambertX,
            lambertY: item.lambertY,
            geocodingSource: item.geocodingSource,
            geocodingScore: item.geocodingScore,
            geocodedAt: geocodedAt,
            needsLocationCheck: item.needsLocationCheck,
        }).returning();

        try {
            await db.insert(jobs).values({
                companiesId: companyId,
                userId: posterId,
                addressId: address.id,
                title: item.title,
                description: item.description,
                type: CONTRACT_TYPES[item.contract] ?? 0,
                sector: item.sector,
                remote: REMOTE_LEVELS[item.remote] ?? 0,
                salaryMin: item.salaryMin,
                salaryMax: item.salaryMax,
                createdAt: new Date(item.publishedAt),
            });
            created++;
        } catch (error) {
            // L'adresse ne sert plus à rien si l'offre n'a pas pu être créée.
            await db.delete(addresses).where(eq(addresses.id, address.id));
            skipped++;
            console.error(`[seed] offre ignoree : "${item.title}" chez ${item.company}`, error);
        }
    }

    console.log(
        `[seed] created ${created} jobs across ${companyIds.size} companies ` +
        `(${skipped} ignorees sur ${list.length})`,
    );
}

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

    let companyId: number;
    if (existingCompany) {
        companyId = existingCompany.id;
    } else {
        const [address] = await db.insert(addresses).values({
            label: "12 rue de la Paix, 75002 Paris",
            street: "12 rue de la Paix",
            postalCode: "75002",
            city: "Paris",
            latitude: 48.8698,
            longitude: 2.3312,
            geocodingSource: "seed",
            geocodingScore: 1,
            geocodedAt: new Date(),
            needsLocationCheck: false,
        }).returning();

        const [company] = await db.insert(companies).values({
            name: "Acme Corp",
            siret: "12345678900011",
            description: "Entreprise de démonstration",
            link: "https://acme.example",
            employeeRange: 1,
            addressId: address.id,
        }).returning();

        companyId = company.id;
    }

    await ensureUser("admin@demo.local", "Admin Demo", "Admin", "Demo", 0);
    await ensureUser("employer@demo.local", "Employeur Demo", "Employeur", "Demo", 1, companyId);
    await ensureUser("candidate@demo.local", "Candidat Demo", "Candidat", "Demo", 2);

    const poster = await db.query.users.findFirst({
        where: eq(users.email, "employer@demo.local"),
    });
    if (poster) {
        await seedJobs(poster.id);
    }

    console.log("[seed] done");
    await client.end();
}

main().catch((err) => {
    console.error("[seed] failed", err);
    process.exit(1);
});
