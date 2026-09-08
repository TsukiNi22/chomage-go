import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {db} from "../db/index.ts";
import {users, companies, jobs, applications, addresses, reports} from "../db/schema.ts";
import {and, count, eq, ilike, isNotNull, isNull, or, sql} from "drizzle-orm";
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
    const [reportTotal] = await db.select({total: count()}).from(reports);
    const [openReports] = await db.select({total: count()}).from(reports).where(eq(reports.status, 0));

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
        reports: reportTotal.total,
        openReports: openReports.total,
        byRank: byRank,
        byApplicationStatus: byStatus,
        topCities: topCities,
        topSectors: topSectors,
    });

    next();
}

function searchTerm(value: unknown): string | null
{
    if (typeof value !== "string") {
        return null;
    }
    const term = value.trim();
    if (term === "") {
        return null;
    }
    return "%" + term + "%";
}

export async function getUsers(req: Request, res: Response, next: NextFunction)
{
    await requireAdmin(req);

    const term = searchTerm(req.query.q);
    const filters = [];

    if (term !== null) {
        filters.push(or(
            ilike(users.firstname, term),
            ilike(users.lastname, term),
            ilike(users.email, term),
        ));
    }

    if (req.query.rank !== undefined && req.query.rank !== "") {
        const rank = Number(req.query.rank);
        if (isNaN(rank)) {
            throw new HttpError(400, "Filtre de rôle invalide");
        }
        filters.push(eq(users.rank, rank));
    }

    if (req.query.state === "suspended") {
        filters.push(and(isNotNull(users.suspendedAt), isNull(users.bannedAt)));
    }
    if (req.query.state === "banned") {
        filters.push(isNotNull(users.bannedAt));
    }
    if (req.query.state === "active") {
        filters.push(and(isNull(users.suspendedAt), isNull(users.bannedAt)));
    }

    let where = undefined;
    if (filters.length > 0) {
        where = and(...filters);
    }

    const list = await db.query.users.findMany({
        where: where,
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

export async function patchRank(req: Request, res: Response, next: NextFunction)
{
    const admin = await requireAdmin(req);

    const id = parseId(req.params.id, "Identifiant utilisateur invalide");

    if (!validateJson(schemas.rankSchema, req, res)) {
        return;
    }

    if (id === admin.id) {
        throw new HttpError(400, "Vous ne pouvez pas modifier votre propre rôle");
    }

    const target = await db.query.users.findFirst({
        where: eq(users.id, id),
    });
    if (!target) {
        throw new HttpError(404, "Utilisateur introuvable");
    }

    const rank = req.body.rank;

    const values: { rank: number; companiesId?: number | null } = { rank: rank };
    // Un candidat n'a rien à faire rattaché à une entreprise.
    if (rank === 2) {
        values.companiesId = null;
    }
    if (rank === 1 && target.companiesId === null) {
        throw new HttpError(400, "Rattachez d'abord ce compte à une entreprise pour en faire un employeur");
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
            companiesId: users.companiesId,
        });

    res.json(rows[0]);

    next();
}

export async function getJobs(req: Request, res: Response, next: NextFunction)
{
    await requireAdmin(req);

    const term = searchTerm(req.query.q);

    const list = await db.query.jobs.findMany({
        with: {
            company: true,
            address: true,
            poster: {
                columns: { id: true, firstname: true, lastname: true, email: true },
            },
        },
    });

    const counts = await db.select({jobId: applications.jobId, total: count()})
        .from(applications)
        .groupBy(applications.jobId);

    const byJob: Record<number, number> = {};
    for (const row of counts) {
        byJob[row.jobId] = row.total;
    }

    let rows = list.map(function (job) {
        let applicants = byJob[job.id];
        if (applicants === undefined) {
            applicants = 0;
        }
        return { ...job, applicantsCount: applicants };
    });

    if (term !== null) {
        const needle = term.slice(1, -1).toLowerCase();
        rows = rows.filter(function (job) {
            const haystack = [
                job.title,
                job.sector || "",
                job.company?.name || "",
                job.address?.city || "",
            ].join(" ").toLowerCase();
            return haystack.includes(needle);
        });
    }

    res.json(rows);

    next();
}

export async function getReports(req: Request, res: Response, next: NextFunction)
{
    await requireAdmin(req);

    const filters = [];

    if (req.query.status !== undefined && req.query.status !== "") {
        const status = Number(req.query.status);
        if (isNaN(status)) {
            throw new HttpError(400, "Filtre de statut invalide");
        }
        filters.push(eq(reports.status, status));
    }

    let where = undefined;
    if (filters.length > 0) {
        where = and(...filters);
    }

    const list = await db.query.reports.findMany({
        where: where,
        with: {
            reporter: {
                columns: { id: true, firstname: true, lastname: true, email: true },
            },
            targetUser: {
                columns: { id: true, firstname: true, lastname: true, email: true },
            },
            job: {
                with: { company: true },
            },
        },
    });

    let rows = list;

    const term = searchTerm(req.query.q);
    if (term !== null) {
        const needle = term.slice(1, -1).toLowerCase();
        rows = rows.filter(function (report) {
            const haystack = [
                report.reason,
                report.description || "",
                report.job?.title || "",
                report.job?.company?.name || "",
                report.targetUser ? report.targetUser.firstname + " " + report.targetUser.lastname : "",
                report.reporter ? report.reporter.firstname + " " + report.reporter.lastname : "",
            ].join(" ").toLowerCase();
            return haystack.includes(needle);
        });
    }

    res.json(rows);

    next();
}

export async function patchReport(req: Request, res: Response, next: NextFunction)
{
    await requireAdmin(req);

    const id = parseId(req.params.id, "Identifiant de signalement invalide");

    if (!validateJson(schemas.reportStatusSchema, req, res)) {
        return;
    }

    const report = await db.query.reports.findFirst({
        where: eq(reports.id, id),
    });
    if (!report) {
        throw new HttpError(404, "Signalement introuvable");
    }

    const rows = await db.update(reports)
        .set({status: req.body.status})
        .where(eq(reports.id, id))
        .returning();

    res.json(rows[0]);

    next();
}
