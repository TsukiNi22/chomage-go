import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import * as schemas from "../schemas/applications.schema.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {isUniqueViolation} from "../utils/dbError.utils.ts";
import {db} from "../db/index.ts";
import {applications, jobs} from "../db/schema.ts";
import {count, eq} from "drizzle-orm";

export async function postApplication(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    if (!validateJson(schemas.postApplicationSchema, req, res)) {
        return;
    }

    const job = await db.query.jobs.findFirst({
        where: eq(jobs.id, req.body.job_id),
    });
    if (!job) {
        throw new HttpError(404, "Offre introuvable");
    }

    if (job.maxApplicants !== null) {
        const rows = await db.select({total: count()})
            .from(applications)
            .where(eq(applications.jobId, job.id));

        if (rows[0].total >= job.maxApplicants) {
            throw new HttpError(409, "Cette offre a atteint son nombre maximum de candidatures");
        }
    }

    let created;
    try {
        const rows = await db.insert(applications).values({
            jobId: req.body.job_id,
            userId: user.id,
            description: req.body.description,
        }).returning();
        created = rows[0];
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new HttpError(409, "Vous avez déjà postulé à cette offre");
        }
        throw error;
    }

    res.status(201).json(created);

    next();
}

export async function getApplication(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const list = await db.query.applications.findMany({
        where: eq(applications.userId, user.id),
        with: {
            job: {
                with: {
                    company: true,
                    address: true,
                },
            },
        },
    });

    res.json(list);

    next();
}

export async function deleteApplication(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new HttpError(400, "Identifiant de candidature invalide");
    }

    const application = await db.query.applications.findFirst({
        where: eq(applications.id, id),
    });
    if (!application) {
        throw new HttpError(404, "Candidature introuvable");
    }

    if (application.userId !== user.id) {
        if (user.rank !== 0) {
            throw new HttpError(403, "Cette candidature ne vous appartient pas");
        }
    }

    await db.delete(applications).where(eq(applications.id, id));

    res.json({message: "Candidature supprimée"});

    next();
}

export async function patchApplication(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new HttpError(400, "Identifiant de candidature invalide");
    }

    if (!validateJson(schemas.patchApplicationSchema, req, res)) {
        return;
    }

    const application = await db.query.applications.findFirst({
        where: eq(applications.id, id),
        with: {
            job: true,
        },
    });
    if (!application) {
        throw new HttpError(404, "Candidature introuvable");
    }

    if (user.rank !== 0) {
        if (!application.job || application.job.companiesId !== user.companiesId) {
            throw new HttpError(403, "Cette candidature ne concerne pas votre entreprise");
        }
    }

    const rows = await db.update(applications)
        .set({status: req.body.status})
        .where(eq(applications.id, id))
        .returning();

    res.json(rows[0]);

    next();
}
