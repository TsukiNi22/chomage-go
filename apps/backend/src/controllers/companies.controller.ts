import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../types/httpError";
import * as schemas from "../schemas/companies.schema";
import {getCurrentUser} from "../utils/currentUser.utils";
import {isUniqueViolation} from "../utils/dbError.utils";
import {db} from "../db";
import {companies, users} from "../db/schema";
import {eq} from "drizzle-orm";

type CompanyValues = {
    name?: string;
    siret?: string;
    description?: string;
    link?: string;
    employeeRange?: number;
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

export async function getCompanies(req: Request, res: Response, next: NextFunction)
{
    const list = await db.query.companies.findMany();

    res.json(list);

    next();
}

export async function getCompanie(req: Request, res: Response, next: NextFunction)
{
    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new HttpError(400, "Identifiant d'entreprise invalide");
    }

    const company = await db.query.companies.findFirst({
        where: eq(companies.id, id),
    });
    if (!company) {
        throw new HttpError(404, "Entreprise introuvable");
    }

    res.json(company);

    next();
}

export async function postCompanie(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    if (!validateJson(schemas.postCompagnieSchema, req, res)) {
        return;
    }

    let created;
    try {
        const rows = await db.insert(companies).values({
            name: req.body.name,
            siret: req.body.siret,
            description: req.body.description,
            link: req.body.link,
            employeeRange: req.body.employee_range,
        }).returning();
        created = rows[0];
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new HttpError(409, "Cette entreprise existe déjà");
        }
        throw error;
    }

    let newRank = 1;
    if (user.rank === 0) {
        newRank = 0;
    }

    await db.update(users).set({
        companiesId: created.id,
        rank: newRank,
    }).where(eq(users.id, user.id));

    res.status(201).json(created);

    next();
}

export async function patchCompanie(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new HttpError(400, "Identifiant d'entreprise invalide");
    }

    if (!validateJson(schemas.patchCompagnieSchema, req, res)) {
        return;
    }

    const company = await db.query.companies.findFirst({
        where: eq(companies.id, id),
    });
    if (!company) {
        throw new HttpError(404, "Entreprise introuvable");
    }

    checkCompanyAccess(user.rank, user.companiesId, id);

    const values: CompanyValues = {};
    if (req.body.name !== undefined)
        values.name = req.body.name;
    if (req.body.siret !== undefined)
        values.siret = req.body.siret;
    if (req.body.description !== undefined)
        values.description = req.body.description;
    if (req.body.link !== undefined)
        values.link = req.body.link;
    if (req.body.employee_range !== undefined)
        values.employeeRange = req.body.employee_range;
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    let updated;
    try {
        const rows = await db.update(companies)
            .set(values)
            .where(eq(companies.id, id))
            .returning();
        updated = rows[0];
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new HttpError(409, "Cette entreprise existe déjà");
        }
        throw error;
    }

    res.json(updated);

    next();
}

export async function deleteCompanie(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    const id = Number(req.params.id);
    if (isNaN(id))
        throw new HttpError(400, "Identifiant d'entreprise invalide");

    const company = await db.query.companies.findFirst({
        where: eq(companies.id, id),
    });
    if (!company)
        throw new HttpError(404, "Entreprise introuvable");

    checkCompanyAccess(user.rank, user.companiesId, id);

    await db.delete(companies).where(eq(companies.id, id));

    res.json({message: "Entreprise supprimée"});

    next();
}
