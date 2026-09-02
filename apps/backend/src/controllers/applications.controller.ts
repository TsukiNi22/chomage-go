import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import {postApplicationSchema} from "../schemas/applications.schema";

export async function postApplication(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postApplicationSchema, req, res)) {
            return next();
        }

        const {job_id} = req.body;

        // TODO: DB - const job = db.prepare("SELECT id FROM jobs WHERE id = ?").get(job_id);
        const job: any = undefined; // placeholder
        if (!job) {
            throw new HttpError(404, "job not found");
        }

        // TODO: DB - const existing = db.prepare("SELECT id FROM applications WHERE job_id = ? AND user_id = ?").get(job_id, req.userId);
        const existing: any = undefined; // placeholder
        if (existing) {
            throw new HttpError(409, "already applied");
        }

        // TODO: DB - INSERT INTO applications (job_id, user_id) VALUES (?, ?)
        // const applicationId = result.lastInsertRowid;
        const applicationId: any = undefined; // placeholder

        res.status(201).json({id: applicationId, job_id, user_id: req.userId});

    } catch (error) {
        next(error);
    }
    next();
}

export async function getApplication(req: Request, res: Response, next: NextFunction) {
    try {
        const userIdQuery = req.query.userId ? Number(req.query.userId) : undefined;
        const jobIdQuery = req.query.jobId ? Number(req.query.jobId) : undefined;

        if (!userIdQuery && !jobIdQuery) {
            throw new HttpError(400, "userId or jobId query param required");
        }
        if ((req.query.userId && !Number.isInteger(userIdQuery)) || (req.query.jobId && !Number.isInteger(jobIdQuery))) {
            throw new HttpError(400, "invalid userId or jobId");
        }

        if (userIdQuery && userIdQuery !== req.userId) {
            // TODO: DB - const currentUser = db.prepare("SELECT rank FROM users WHERE id = ?").get(req.userId);
            const currentUser: any = undefined; // placeholder
            if (!currentUser || currentUser.rank !== 0) {
                throw new HttpError(403, "not allowed");
            }
        }

        if (jobIdQuery) {
            // TODO: DB - const job = db.prepare("SELECT user_id FROM jobs WHERE id = ?").get(jobIdQuery);
            const job: any = undefined; // placeholder
            if (!job) {
                throw new HttpError(404, "job not found");
            }
            if (job.user_id !== req.userId) {
                // TODO: DB - const currentUser = db.prepare("SELECT rank FROM users WHERE id = ?").get(req.userId);
                const currentUser: any = undefined; // placeholder
                if (!currentUser || currentUser.rank !== 0) {
                    throw new HttpError(403, "not allowed");
                }
            }
        }

        // TODO: DB - si userIdQuery : db.prepare("SELECT * FROM applications WHERE user_id = ?").all(userIdQuery)
        // TODO: DB - si jobIdQuery : db.prepare("SELECT * FROM applications WHERE job_id = ?").all(jobIdQuery)
        const applications: any[] = []; // placeholder

        res.json(applications);

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const application = db.prepare("SELECT * FROM applications WHERE id = ?").get(id);
        const application: any = undefined; // placeholder
        if (!application) {
            throw new HttpError(404, "application not found");
        }

        if (application.user_id !== req.userId) {
            // TODO: DB - vérifier aussi si req.userId est owner du job lié (jobs.user_id) ou rank 0 admin
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - DELETE FROM applications WHERE id = ?

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}
