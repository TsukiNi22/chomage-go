import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import {postCompagnieSchema, patchCompagnieSchema} from "../schemas/companies.schema";

export async function getCompagnies(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: DB - const companies = db.prepare("SELECT * FROM companies").all();
        const companies: any[] = []; // placeholder

        res.json(companies);

    } catch (error) {
        next(error);
    }
    next();
}

export async function getCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const company = db.prepare("SELECT * FROM companies WHERE id = ?").get(id);
        const company: any = undefined; // placeholder

        if (!company) {
            throw new HttpError(404, "company not found");
        }

        res.json(company);

    } catch (error) {
        next(error);
    }
    next();
}

export async function postCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postCompagnieSchema, req, res)) {
            return next();
        }

        const {name, siret, description, link, employee_range} = req.body;

        // TODO: DB - const currentUser = db.prepare("SELECT rank FROM users WHERE id = ?").get(req.userId);
        const currentUser: any = undefined; // placeholder
        if (!currentUser || (currentUser.rank !== 0 && currentUser.rank !== 1)) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - const existing = db.prepare("SELECT id FROM companies WHERE name = ? AND siret = ?").get(name, siret);
        const existing: any = undefined; // placeholder
        if (existing) {
            throw new HttpError(409, "company already exists");
        }

        // TODO: DB - INSERT INTO companies (name, siret, description, link, employee_range) VALUES (...)
        // const companyId = result.lastInsertRowid;
        const companyId: any = undefined; // placeholder

        // TODO: DB - lier req.userId à companies_id : UPDATE users SET companies_id = ? WHERE id = ?

        res.status(201).json({id: companyId, name, siret, description, link, employee_range});

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchCompagnieSchema, req, res)) {
            return next();
        }

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const company = db.prepare("SELECT id FROM companies WHERE id = ?").get(id);
        const company: any = undefined; // placeholder
        if (!company) {
            throw new HttpError(404, "company not found");
        }

        // TODO: DB - const currentUser = db.prepare("SELECT rank, companies_id FROM users WHERE id = ?").get(req.userId);
        const currentUser: any = undefined; // placeholder
        if (!currentUser || (currentUser.rank !== 0 && currentUser.companies_id !== id)) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - UPDATE companies SET ... WHERE id = ?

        res.json({id, ...req.body});

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const company = db.prepare("SELECT id FROM companies WHERE id = ?").get(id);
        const company: any = undefined; // placeholder
        if (!company) {
            throw new HttpError(404, "company not found");
        }

        // TODO: DB - const currentUser = db.prepare("SELECT rank, companies_id FROM users WHERE id = ?").get(req.userId);
        const currentUser: any = undefined; // placeholder
        if (!currentUser || (currentUser.rank !== 0 && currentUser.companies_id !== id)) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - DELETE company (+ cascade jobs liés ?)

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}
