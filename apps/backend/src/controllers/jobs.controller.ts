import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import * as schemas from "../schemas/jobs.schema.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {getOptionalUser, isModerated} from "../utils/optionalUser.utils.ts";
import {isUniqueViolation} from "../utils/dbError.utils.ts";
import {createAddress} from "../utils/address.utils.ts";
import {db} from "../db/index.ts";
import {applications, companies, jobs, jobSkills} from "../db/schema.ts";
import {eq} from "drizzle-orm";
import {
    JOBS_CACHE_KEY,
    invalidatePublicCache,
    readPublicCache,
    writePublicCache,
} from "../utils/publicCache.utils.ts";

type JobValues = {
    title?: string;
    description?: string;
    type?: number;
    sector?: string;
    remote?: number;
    addressId?: number | null;
    maxApplicants?: number;
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

// Une offre disparaît de la diffusion publique dès que son entreprise ou l'employeur
// qui l'a publiée est suspendu ou banni. Les administrateurs continuent de tout voir.
const withModerationSources = {
    company: true,
    address: true,
    skills: true,
    poster: {
        columns: { id: true, suspendedAt: true, bannedAt: true },
    },
} as const;

type JobWithPoster = {
    company: { suspendedAt: Date | null; bannedAt: Date | null } | null;
    poster: { suspendedAt: Date | null; bannedAt: Date | null } | null;
};

function isPubliclyVisible(job: JobWithPoster): boolean
{
    if (job.company !== null && isModerated(job.company)) {
        return false;
    }
    if (job.poster !== null && isModerated(job.poster)) {
        return false;
    }
    return true;
}

function stripPoster<T extends { poster?: unknown }>(job: T)
{
    const copy = { ...job };
    delete copy.poster;
    return copy;
}

export async function getJobs(req: Request, res: Response, next: NextFunction)
{
    const viewer = await getOptionalUser(req);
    const isAdmin = viewer !== null && viewer.rank === 0;

    // La liste publique est la meme pour tout le monde : on sert la reponse
    // deja serialisee plutot que de refaire mapping + JSON.stringify par visiteur.
    if (!isAdmin) {
        const cached = readPublicCache(JOBS_CACHE_KEY);
        if (cached !== null) {
            res.type("application/json").send(cached);
            next();
            return;
        }
    }

    const list = await db.query.jobs.findMany({
        with: withModerationSources,
    });

    let rows = list;
    if (!isAdmin) {
        rows = rows.filter(isPubliclyVisible);
    }

    const payload = rows.map(stripPoster);

    if (isAdmin) {
        res.json(payload); // vue administrateur : jamais memorisee
        next();
        return;
    }

    const body = JSON.stringify(payload);
    writePublicCache(JOBS_CACHE_KEY, body);
    res.type("application/json").send(body);

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
        with: withModerationSources,
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    if (!isPubliclyVisible(job)) {
        const viewer = await getOptionalUser(req);
        const isAdmin = viewer !== null && viewer.rank === 0;
        const isMember = viewer !== null && viewer.companiesId === job.companiesId;

        if (!isAdmin && !isMember) {
            throw new HttpError(404, "Offre introuvable");
        }
    }

    res.json(stripPoster(job));

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

    // Une offre peut porter son propre lieu ; sans adresse saisie on retombe sur celle de l'entreprise.
    let addressId = req.body.address_id;
    if (req.body.address !== undefined) {
        addressId = await createAddress(req.body.address);
    }
    if (addressId === undefined || addressId === null) {
        addressId = company.addressId;
    }

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
            addressId: addressId,
            maxApplicants: req.body.max_applicants,
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
    if (req.body.address !== undefined)
        values.addressId = await createAddress(req.body.address);
    if (req.body.max_applicants !== undefined)
        values.maxApplicants = req.body.max_applicants;
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

export async function getJobApplications(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

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

    checkCompanyAccess(user.rank, user.companiesId, job.companiesId);

    const list = await db.query.applications.findMany({
        where: eq(applications.jobId, jobId),
        with: {
            user: {
                columns: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    emailContact: true,
                    emailVerified: true,
                    description: true,
                    resume: true,
                    address: true,
                    createdAt: true,
                    suspendedAt: true,
                    bannedAt: true,
                },
                with: {
                    skills: true,
                },
            },
        },
    });

    res.json(list);

    next();
}
