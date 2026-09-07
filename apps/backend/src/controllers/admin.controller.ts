import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {db} from "../db/index.ts";
import {users, companies, jobs, applications, addresses} from "../db/schema.ts";
import {count, eq, isNotNull, sql} from "drizzle-orm";
import * as schemas from "../schemas/admin.schema.ts";

async function requireAdmin(req: Request)
{
    const user = await getCurrentUser(req);
    if (user.rank !== 0) {
        throw new HttpError(403, "Accès réservé aux administrateurs");
    }
    return user;
}

function parseId(value: unknown, message: string)
{
    const id = Number(value);
    if (isNaN(id)) {
        throw new HttpError(400, message);
    }
    return id;
}

export async function getMetrics(req: Request, res: Response, next: NextFunction)
{
    await requireAdmin(req);

    const [userTotal] = await db.select({total: count()}).from(users);
    const [companyTotal] = await db.select({total: count()}).from(companies);
    const [jobTotal] = await db.select({total: count()}).from(jobs);
    const [applicationTotal] = await db.select({total: count()}).from(applications);
    const [suspended] = await db.select({total: count()}).from(users).where(isNotNull(users.suspendedAt));
    const [banned] = await db.select({total: count()}).from(users).where(isNotNull(users.bannedAt));

    const byRank = await db.select({rank: users.rank, total: count()})
        .from(users)
        .groupBy(users.rank);

    const byStatus = await db.select({status: applications.status, total: count()})
        .from(applications)
        .groupBy(applications.status);

    const topCities = await db.select({city: addresses.city, total: count()})
        .from(jobs)
        .innerJoin(addresses, eq(jobs.addressId, addresses.id))
        .groupBy(addresses.city)
        .orderBy(sql`count(*) desc`)
        .limit(10);

    const topSectors = await db.select({sector: jobs.sector, total: count()})
        .from(jobs)
        .groupBy(jobs.sector)
        .orderBy(sql`count(*) desc`)
        .limit(10);

    res.json({
        users: userTotal.total,
        companies: companyTotal.total,
        jobs: jobTotal.total,
        applications: applicationTotal.total,
        suspended: suspended.total,
        banned: banned.total,
        byRank: byRank,
        byApplicationStatus: byStatus,
        topCities: topCities,
        topSectors: topSectors,
    });

    next();
}

export async function getUsers(req: Request, res: Response, next: NextFunction)
{
    await requireAdmin(req);

    const list = await db.query.users.findMany({
        columns: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            rank: true,
            companiesId: true,
            suspendedAt: true,
            bannedAt: true,
            moderationReason: true,
            createdAt: true,
            lastLoginAt: true,
        },
        with: {
            company: true,
        },
    });

    res.json(list);

    next();
}

export async function patchModeration(req: Request, res: Response, next: NextFunction)
{
    const admin = await requireAdmin(req);

    const id = parseId(req.params.id, "Identifiant utilisateur invalide");

    if (!validateJson(schemas.moderationSchema, req, res)) {
        return;
    }

    if (id === admin.id) {
        throw new HttpError(400, "Vous ne pouvez pas modérer votre propre compte");
    }

    const target = await db.query.users.findFirst({
        where: eq(users.id, id),
    });
    if (!target) {
        throw new HttpError(404, "Utilisateur introuvable");
    }

    const action = req.body.action;
    const values: {
        suspendedAt?: Date | null;
        bannedAt?: Date | null;
        moderationReason?: string | null;
    } = {};

    if (action === "suspend") {
        values.suspendedAt = new Date();
        values.moderationReason = req.body.reason;
    }
    if (action === "reactivate") {
        values.suspendedAt = null;
        values.bannedAt = null;
        values.moderationReason = null;
    }
    if (action === "ban") {
        values.bannedAt = new Date();
        values.suspendedAt = new Date();
        values.moderationReason = req.body.reason;
    }

    const rows = await db.update(users)
        .set(values)
        .where(eq(users.id, id))
        .returning({
            id: users.id,
            firstname: users.firstname,
            lastname: users.lastname,
            email: users.email,
            rank: users.rank,
            suspendedAt: users.suspendedAt,
            bannedAt: users.bannedAt,
            moderationReason: users.moderationReason,
        });

    res.json(rows[0]);

    next();
}

export async function deleteAnyJob(req: Request, res: Response, next: NextFunction)
{
    await requireAdmin(req);

    const id = parseId(req.params.id, "Identifiant d'offre invalide");

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, id),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    await db.delete(jobs).where(eq(jobs.id, id));

    res.json({message: "Offre supprimée"});

    next();
}
