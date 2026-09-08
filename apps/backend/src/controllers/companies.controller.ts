import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import * as schemas from "../schemas/companies.schema.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {isUniqueViolation} from "../utils/dbError.utils.ts";
import {lookupSiret, normalizeSiret} from "../utils/sirene.utils.ts";
import {createAddress} from "../utils/address.utils.ts";
import {db} from "../db/index.ts";
import {companies, users} from "../db/schema.ts";
import {eq} from "drizzle-orm";

type CompanyValues = {
    description?: string | null;
    link?: string | null;
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
    const list = await db.query.companies.findMany({
        with: {
            address: true,
        },
    });

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
        with: {
            address: true,
            jobs: {
                with: {
                    address: true,
                    skills: true,
                },
            },
        },
    });
    if (!company) {
        throw new HttpError(404, "Entreprise introuvable");
    }

    res.json(company);

    next();
}

/**
 * Confronte un SIRET à l'annuaire des entreprises sans rien enregistrer.
 * Sert au formulaire d'inscription employeur pour afficher la raison sociale trouvée.
 */
export async function getSiret(req: Request, res: Response, next: NextFunction)
{
    const establishment = await lookupSiret(String(req.params.siret));

    res.json(establishment);

    next();
}

export async function postCompanie(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

    if (!validateJson(schemas.postCompagnieSchema, req, res)) {
        return;
    }

    const siret = normalizeSiret(req.body.siret);
    const establishment = await lookupSiret(siret);

    let company = await db.query.companies.findFirst({
        where: eq(companies.siret, siret),
    });

    if (!company) {
        let addressId = null;
        if (establishment.address !== null) {
            addressId = await createAddress({
                label: establishment.address.label,
                street: establishment.address.street,
                postal_code: establishment.address.postalCode,
                city: establishment.address.city,
                latitude: establishment.address.latitude,
                longitude: establishment.address.longitude,
            });
        }

        try {
            const rows = await db.insert(companies).values({
                name: establishment.name,
                siret: siret,
                description: req.body.description,
                link: req.body.link,
                employeeRange: establishment.employeeRange,
                activity: establishment.activity,
                legalName: establishment.legalName,
                sireneCheckedAt: new Date(),
                addressId: addressId,
            }).returning();
            company = rows[0];
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new HttpError(409, "Cette entreprise existe déjà");
            }
            throw error;
        }
    }

    let newRank = 1;
    if (user.rank === 0) {
        newRank = 0;
    }

    await db.update(users).set({
        companiesId: company.id,
        rank: newRank,
    }).where(eq(users.id, user.id));

    // Le rôle vient de changer : on invalide le cache de session de Better Auth
    // pour que le client récupère immédiatement son rang d'employeur.
    res.clearCookie("better-auth.session_data", { path: "/" });
    res.clearCookie("__Secure-better-auth.session_data", { path: "/" });

    res.status(201).json(company);

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
    if (req.body.description !== undefined)
        values.description = req.body.description;
    if (req.body.link !== undefined) {
        values.link = req.body.link;
        if (req.body.link === "") {
            values.link = null;
        }
    }
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    const rows = await db.update(companies)
        .set(values)
        .where(eq(companies.id, id))
        .returning();

    res.json(rows[0]);

    next();
}

/**
 * Resynchronise le nom, l'activité, la tranche d'effectifs et l'adresse depuis l'API Sirene.
 */
export async function refreshCompanie(req: Request, res: Response, next: NextFunction)
{
    const user = await getCurrentUser(req);

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

    checkCompanyAccess(user.rank, user.companiesId, id);

    const establishment = await lookupSiret(company.siret);

    let addressId = company.addressId;
    if (establishment.address !== null) {
        addressId = await createAddress({
            label: establishment.address.label,
            street: establishment.address.street,
            postal_code: establishment.address.postalCode,
            city: establishment.address.city,
            latitude: establishment.address.latitude,
            longitude: establishment.address.longitude,
        });
    }

    const rows = await db.update(companies)
        .set({
            name: establishment.name,
            legalName: establishment.legalName,
            activity: establishment.activity,
            employeeRange: establishment.employeeRange,
            sireneCheckedAt: new Date(),
            addressId: addressId,
        })
        .where(eq(companies.id, id))
        .returning();

    res.json(rows[0]);

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
