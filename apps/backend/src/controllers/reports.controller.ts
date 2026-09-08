import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import * as schemas from "../schemas/reports.schema.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {db} from "../db/index.ts";
import {jobs, reports, users} from "../db/schema.ts";
import {and, eq} from "drizzle-orm";

export async function postReport(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    if (!validateJson(schemas.postReportSchema, req, res)) {
        return;
    }

    const jobId = req.body.job_id;
    const targetUserId = req.body.user_id;

    if (jobId === undefined && targetUserId === undefined) {
        throw new HttpError(400, "Indiquez l'offre ou le profil signalé");
    }
    if (jobId !== undefined && targetUserId !== undefined) {
        throw new HttpError(400, "Un signalement porte sur une offre ou sur un profil, pas les deux");
    }

    if (jobId !== undefined) {
        const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
        if (!job) {
            throw new HttpError(404, "Offre introuvable");
        }
    }

    if (targetUserId !== undefined) {
        if (targetUserId === user.id) {
            throw new HttpError(400, "Vous ne pouvez pas signaler votre propre profil");
        }
        const target = await db.query.users.findFirst({ where: eq(users.id, targetUserId) });
        if (!target) {
            throw new HttpError(404, "Utilisateur introuvable");
        }
    }

    // Un même utilisateur ne signale une cible qu'une fois tant que le signalement est ouvert.
    let existing;
    if (jobId !== undefined) {
        existing = await db.query.reports.findFirst({
            where: and(eq(reports.reporterId, user.id), eq(reports.jobId, jobId), eq(reports.status, 0)),
        });
    } else {
        existing = await db.query.reports.findFirst({
            where: and(eq(reports.reporterId, user.id), eq(reports.targetUserId, targetUserId), eq(reports.status, 0)),
        });
    }
    if (existing) {
        throw new HttpError(409, "Vous avez déjà signalé cet élément, il est en cours d'examen");
    }

    const rows = await db.insert(reports).values({
        reporterId: user.id,
        jobId: jobId,
        targetUserId: targetUserId,
        reason: req.body.reason,
        description: req.body.description,
    }).returning();

    res.status(201).json(rows[0]);

    next();
}

export async function getMyReports(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const list = await db.query.reports.findMany({
        where: eq(reports.reporterId, user.id),
    });

    res.json(list);

    next();
}
