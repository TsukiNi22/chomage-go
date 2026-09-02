import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import {postJobSchema, patchJobSchema, postSkillSchema} from "../schemas/jobs.schema";

export async function getJobs(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: DB - const jobs = db.prepare("SELECT * FROM jobs").all();
        const jobs: any[] = []; // placeholder

        res.json(jobs);

    } catch (error) {
        next(error);
    }
    next();
}

export async function getJob(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
        const job: any = undefined; // placeholder

        if (!job) {
            throw new HttpError(404, "job not found");
        }

        res.json(job);

    } catch (error) {
        next(error);
    }
    next();
}

export async function postJob(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postJobSchema, req, res)) {
            return next();
        }

        const {companies_id, title, description, type, salary_min, salary_max} = req.body;

        // TODO: DB - const currentUser = db.prepare("SELECT rank, companies_id FROM users WHERE id = ?").get(req.userId);
        const currentUser: any = undefined; // placeholder
        if (!currentUser || (currentUser.rank !== 0 && currentUser.companies_id !== companies_id)) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - const existing = db.prepare("SELECT id FROM jobs WHERE title = ? AND companies_id = ?").get(title, companies_id);
        const existing: any = undefined; // placeholder
        if (existing) {
            throw new HttpError(409, "job already exists for this company");
        }

        // TODO: DB - INSERT INTO jobs (companies_id, user_id, title, description, type, salary_min, salary_max, created_at)
        // VALUES (companies_id, req.userId, title, description, type, salary_min, salary_max ?? null, Date.now())
        // const jobId = result.lastInsertRowid;
        const jobId: any = undefined; // placeholder

        res.status(201).json({id: jobId, companies_id, title, description, type, salary_min, salary_max});

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchJob(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchJobSchema, req, res)) {
            return next();
        }

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
        const job: any = undefined; // placeholder
        if (!job) {
            throw new HttpError(404, "job not found");
        }

        // TODO: DB - const currentUser = db.prepare("SELECT rank FROM users WHERE id = ?").get(req.userId);
        const currentUser: any = undefined; // placeholder
        if (!currentUser || (currentUser.rank !== 0 && job.user_id !== req.userId)) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - UPDATE jobs SET ... WHERE id = ?

        res.json({id, ...req.body});

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
        const job: any = undefined; // placeholder
        if (!job) {
            throw new HttpError(404, "job not found");
        }

        // TODO: DB - const currentUser = db.prepare("SELECT rank FROM users WHERE id = ?").get(req.userId);
        const currentUser: any = undefined; // placeholder
        if (!currentUser || (currentUser.rank !== 0 && job.user_id !== req.userId)) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - DELETE job (+ cascade job_skills, applications liées)

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}

export async function getSkills(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - vérifier que le job existe
        // TODO: DB - const skills = db.prepare("SELECT * FROM job_skills WHERE job_id = ?").all(id);
        const skills: any[] = []; // placeholder

        res.json(skills);

    } catch (error) {
        next(error);
    }
    next();
}

export async function postSkill(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postSkillSchema, req, res)) {
            return next();
        }

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);
        const job: any = undefined; // placeholder
        if (!job) {
            throw new HttpError(404, "job not found");
        }

        if (job.user_id !== req.userId) {
            throw new HttpError(403, "not allowed");
        }

        const {name, description} = req.body;

        // TODO: DB - INSERT INTO job_skills (job_id, name, description) VALUES (?, ?, ?)

        res.status(201).json({job_id: id, name, description});

    } catch (error) {
        next(error);
    }
    next();
}


export async function patchSkill(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchSkillSchema, req, res)) {
            return next();
        }

        const id = Number(req.params.id);
        const skillId = Number(req.params.skillId);
        if (!Number.isInteger(id) || !Number.isInteger(skillId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const skill = db.prepare("SELECT * FROM job_skills WHERE id = ? AND job_id = ?").get(skillId, id);
        const skill: any = undefined; // placeholder
        if (!skill) {
            throw new HttpError(404, "skill not found");
        }

        // TODO: DB - const job = db.prepare("SELECT user_id FROM jobs WHERE id = ?").get(id);
        const job: any = undefined; // placeholder
        if (!job || job.user_id !== req.userId) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - UPDATE job_skills SET ... WHERE id = ?

        res.json({id: skillId, ...req.body});

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const skillId = Number(req.params.skillId);
        if (!Number.isInteger(id) || !Number.isInteger(skillId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const skill = db.prepare("SELECT * FROM job_skills WHERE id = ? AND job_id = ?").get(skillId, id);
        const skill: any = undefined; // placeholder
        if (!skill) {
            throw new HttpError(404, "skill not found");
        }

        // TODO: DB - const job = db.prepare("SELECT user_id FROM jobs WHERE id = ?").get(id);
        const job: any = undefined; // placeholder
        if (!job || job.user_id !== req.userId) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - DELETE FROM job_skills WHERE id = ?

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}
