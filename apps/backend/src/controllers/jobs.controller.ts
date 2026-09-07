import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import * as schemas from "../schemas/jobs.schema.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {isUniqueViolation} from "../utils/dbError.utils.ts";
import {db} from "../db/index.ts";
import {companies, jobs, jobSkills} from "../db/schema.ts";
import {eq} from "drizzle-orm";

type JobValues = {
    title?: string;
    description?: string;
    type?: number;
    sector?: string;
    remote?: number;
    addressId?: number;
    salaryMin?: number;
    salaryMax?: number;
};

type SkillValues = {
    name?: string;
    description?: string;
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
            address: true,
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
            address: true,
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
            sector: req.body.sector,
            remote: req.body.remote,
            addressId: req.body.address_id,
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
    if (req.body.sector !== undefined)
        values.sector = req.body.sector;
    if (req.body.remote !== undefined)
        values.remote = req.body.remote;
    if (req.body.address_id !== undefined)
        values.addressId = req.body.address_id;
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

export async function getSkills(req: Request, res: Response, next: NextFunction)
{
    const jobId = Number(req.params.id);
    if (isNaN(jobId)) {
        throw new HttpError(400, "Identifiant d'offre invalide");
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    const list = await db.query.jobSkills.findMany({
        where: eq(jobSkills.jobId, jobId),
    });

    res.json(list);

    next();
}

export async function postSkill(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const jobId = Number(req.params.id);
    if (isNaN(jobId)) {
        throw new HttpError(400, "Identifiant d'offre invalide");
    }

    if (!validateJson(schemas.postSkillSchema, req, res)) {
        return;
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    checkCompanyAccess(user.rank, user.companiesId, job.companiesId);

    const rows = await db.insert(jobSkills).values({
        jobId: jobId,
        name: req.body.name,
        description: req.body.description,
    }).returning();

    res.status(201).json(rows[0]);

    next();
}

export async function patchSkill(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const jobId = Number(req.params.id);
    if (isNaN(jobId)) {
        throw new HttpError(400, "Identifiant d'offre invalide");
    }

    const skillId = Number(req.params.skillId);
    if (isNaN(skillId)) {
        throw new HttpError(400, "Identifiant de compétence invalide");
    }

    if (!validateJson(schemas.patchSkillSchema, req, res)) {
        return;
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    checkCompanyAccess(user.rank, user.companiesId, job.companiesId);

    const skill = await db.query.jobSkills.findFirst({
        where: eq(jobSkills.id, skillId),
    });
    if (!skill) {
        throw new HttpError(404, "Compétence introuvable");
    }
    if (skill.jobId !== jobId) {
        throw new HttpError(404, "Compétence introuvable");
    }

    const values: SkillValues = {};
    if (req.body.name !== undefined)
        values.name = req.body.name;
    if (req.body.description !== undefined)
        values.description = req.body.description;
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    const rows = await db.update(jobSkills)
        .set(values)
        .where(eq(jobSkills.id, skillId))
        .returning();

    res.json(rows[0]);

    next();
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const jobId = Number(req.params.id);
    if (isNaN(jobId)) {
        throw new HttpError(400, "Identifiant d'offre invalide");
    }

    const skillId = Number(req.params.skillId);
    if (isNaN(skillId)) {
        throw new HttpError(400, "Identifiant de compétence invalide");
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, jobId),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    checkCompanyAccess(user.rank, user.companiesId, job.companiesId);

    const skill = await db.query.jobSkills.findFirst({
        where: eq(jobSkills.id, skillId),
    });
    if (!skill) {
        throw new HttpError(404, "Compétence introuvable");
    }
    if (skill.jobId !== jobId) {
        throw new HttpError(404, "Compétence introuvable");
    }

    await db.delete(jobSkills).where(eq(jobSkills.id, skillId));

    res.json({message: "Compétence supprimée"});

    next();
}
