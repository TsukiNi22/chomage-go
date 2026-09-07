import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../types/httpError";
import * as schemas from "../schemas/jobs.schema";
import {getCurrentUser} from "../utils/currentUser.utils";
import {isUniqueViolation} from "../utils/dbError.utils";
import {db} from "../db";
import {companies, jobs} from "../db/schema";
import {eq} from "drizzle-orm";

type JobValues = {
    title?: string;
    description?: string;
    type?: number;
    salaryMin?: number;
    salaryMax?: number;
};

function checkCompanyAccess(rank: number, companiesId: number | null, companyId: number)
{
    if (rank === 0) {
        return;
    }
    if (companiesId === companyId) {
        return;
    }
    throw new HttpError(403, "Vous ne gérez pas cette entreprise");
}

export async function getJobs(req: Request, res: Response, next: NextFunction)
{
    const list = await db.query.jobs.findMany({
        with: {
            company: true,
        },
    });

    res.json(list);

    next();
}

export async function getJob(req: Request, res: Response, next: NextFunction)
{
    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new HttpError(400, "Identifiant d'offre invalide");
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, id),
        with: {
            company: true,
            skills: true,
        },
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    res.json(job);

    next();
}

export async function postJob(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    if (!validateJson(schemas.postJobSchema, req, res)) {
        return;
    }

    const company = await db.query.companies.findFirst({
        where: eq(companies.id, req.body.companies_id),
    });
    if (!company) {
        throw new HttpError(404, "Entreprise introuvable");
    }

    checkCompanyAccess(user.rank, user.companiesId, req.body.companies_id);

    let created;
    try {
        const rows = await db.insert(jobs).values({
            companiesId: req.body.companies_id,
            userId: user.id,
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            salaryMin: req.body.salary_min,
            salaryMax: req.body.salary_max,
        }).returning();
        created = rows[0];
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new HttpError(409, "Cette offre existe déjà pour cette entreprise");
        }
        throw error;
    }

    res.status(201).json(created);

    next();
}

export async function patchJob(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new HttpError(400, "Identifiant d'offre invalide");
    }

    if (!validateJson(schemas.patchJobSchema, req, res)) {
        return;
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, id),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    checkCompanyAccess(user.rank, user.companiesId, job.companiesId);

    const values: JobValues = {};
    if (req.body.title !== undefined)
        values.title = req.body.title;
    if (req.body.description !== undefined)
        values.description = req.body.description;
    if (req.body.type !== undefined)
        values.type = req.body.type;
    if (req.body.salary_min !== undefined)
        values.salaryMin = req.body.salary_min;
    if (req.body.salary_max !== undefined)
        values.salaryMax = req.body.salary_max;
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    let updated;
    try {
        const rows = await db.update(jobs)
            .set(values)
            .where(eq(jobs.id, id))
            .returning();
        updated = rows[0];
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new HttpError(409, "Cette offre existe déjà pour cette entreprise");
        }
        throw error;
    }

    res.json(updated);

    next();
}

export async function deleteJob(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new HttpError(400, "Identifiant d'offre invalide");
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, id),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    checkCompanyAccess(user.rank, user.companiesId, job.companiesId);

    await db.delete(jobs).where(eq(jobs.id, id));

    res.json({message: "Offre supprimée"});

    next();
}

export function getSkills(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}
