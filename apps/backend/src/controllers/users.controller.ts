import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.ts";
import {HttpError} from "../types/httpError.ts";
import {getCurrentUser} from "../utils/currentUser.utils.ts";
import {db} from "../db/index.ts";
import {users, userSkills, experience, availability, companies} from "../db/schema.ts";
import {eq} from "drizzle-orm";
import * as schemas from "../schemas/users.schema.ts";

type UserValues = {
    firstname?: string;
    lastname?: string;
    emailContact?: string;
    address?: string;
    description?: string;
    resume?: string;
    localisation?: boolean;
};

type SkillValues = {
    name?: string;
    description?: string;
};

type ExperienceValues = {
    companiesId?: number;
    name?: string;
    description?: string;
    type?: number;
    partTime?: boolean;
    start?: Date;
    end?: Date;
};

type AvailabilityValues = {
    title?: string;
    type?: number;
    partTime?: boolean;
    start?: Date;
    end?: Date;
};

function toDate(value: string | undefined)
{
    if (value === undefined) {
        return undefined;
    }
    return new Date(value);
}

function parseParam(value: unknown, message: string)
{
    const id = Number(value);
    if (isNaN(id)) {
        throw new HttpError(400, message);
    }
    return id;
}

async function resolveUserId(req: Request)
{
    if (req.params.id !== undefined) {
        return parseParam(req.params.id, "Identifiant utilisateur invalide");
    }
    const current = await getCurrentUser(req);
    return current.id;
}

function checkOwner(ownerId: number, rank: number, currentId: number, message: string)
{
    if (ownerId === currentId) {
        return;
    }
    if (rank === 0) {
        return;
    }
    throw new HttpError(403, message);
}

export async function getUser(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    let id = current.id;
    if (req.params.id !== undefined) {
        id = parseParam(req.params.id, "Identifiant utilisateur invalide");
    }

    const isSelf = (id === current.id);

    const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
            id: true,
            firstname: true,
            lastname: true,
            companiesId: true,
            emailContact: true,
            address: true,
            addressId: isSelf,
            description: true,
            resume: true,
            rank: isSelf,
            email: isSelf,
            emailVerified: isSelf,
            localisation: isSelf,
            passwordHash: false,
            allowedAt: false,
            createdAt: false,
            updatedAt: false,
        },
        with: {
            address: true,
            company: true,
        },
    });
    if (!user) {
        throw new HttpError(404, "Utilisateur introuvable");
    }

    res.json(user);

    next();
}

export async function patchUser(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    if (!validateJson(schemas.patchUserSchema, req, res)) {
        return;
    }

    const values: UserValues = {};
    if (req.body.firstname !== undefined)
        values.firstname = req.body.firstname;
    if (req.body.lastname !== undefined)
        values.lastname = req.body.lastname;
    if (req.body.email_contact !== undefined)
        values.emailContact = req.body.email_contact;
    if (req.body.address !== undefined)
        values.address = req.body.address;
    if (req.body.description !== undefined)
        values.description = req.body.description;
    if (req.body.resume !== undefined)
        values.resume = req.body.resume;
    if (req.body.localisation !== undefined)
        values.localisation = req.body.localisation;
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    const rows = await db.update(users)
        .set(values)
        .where(eq(users.id, current.id))
        .returning({
            id: users.id,
            firstname: users.firstname,
            lastname: users.lastname,
            companiesId: users.companiesId,
            emailContact: users.emailContact,
            address: users.address,
            description: users.description,
            resume: users.resume,
            rank: users.rank,
            email: users.email,
            localisation: users.localisation,
        });

    res.json(rows[0]);

    next();
}

export async function deleteUser(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    await db.delete(users).where(eq(users.id, current.id));

    res.json({message: "Compte supprimé"});

    next();
}

export async function getSkill(req: Request, res: Response, next: NextFunction)
{
    const userId = await resolveUserId(req);

    const list = await db.query.userSkills.findMany({
        where: eq(userSkills.userId, userId),
    });

    res.json(list);

    next();
}

export async function postSkill(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    if (!validateJson(schemas.postSkillSchema, req, res)) {
        return;
    }

    const rows = await db.insert(userSkills).values({
        userId: current.id,
        name: req.body.name,
        description: req.body.description,
    }).returning();

    res.status(201).json(rows[0]);

    next();
}

export async function patchSkill(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    const skillId = parseParam(req.params.skillId, "Identifiant de compétence invalide");

    if (!validateJson(schemas.patchSkillSchema, req, res)) {
        return;
    }

    const skill = await db.query.userSkills.findFirst({
        where: eq(userSkills.id, skillId),
    });
    if (!skill) {
        throw new HttpError(404, "Compétence introuvable");
    }

    checkOwner(skill.userId, current.rank, current.id, "Cette compétence ne vous appartient pas");

    const values: SkillValues = {};
    if (req.body.name !== undefined)
        values.name = req.body.name;
    if (req.body.description !== undefined)
        values.description = req.body.description;
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    const rows = await db.update(userSkills)
        .set(values)
        .where(eq(userSkills.id, skillId))
        .returning();

    res.json(rows[0]);

    next();
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    const skillId = parseParam(req.params.skillId, "Identifiant de compétence invalide");

    const skill = await db.query.userSkills.findFirst({
        where: eq(userSkills.id, skillId),
    });
    if (!skill) {
        throw new HttpError(404, "Compétence introuvable");
    }

    checkOwner(skill.userId, current.rank, current.id, "Cette compétence ne vous appartient pas");

    await db.delete(userSkills).where(eq(userSkills.id, skillId));

    res.json({message: "Compétence supprimée"});

    next();
}

export async function getExperience(req: Request, res: Response, next: NextFunction)
{
    const userId = await resolveUserId(req);

    const list = await db.query.experience.findMany({
        where: eq(experience.userId, userId),
        with: {
            company: true,
        },
    });

    res.json(list);

    next();
}

export async function postExperience(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    if (!validateJson(schemas.postExperienceSchema, req, res)) {
        return;
    }

    if (req.body.companies_id === undefined) {
        throw new HttpError(400, "Le champ companies_id est obligatoire");
    }

    const company = await db.query.companies.findFirst({
        where: eq(companies.id, req.body.companies_id),
    });
    if (!company) {
        throw new HttpError(404, "Entreprise introuvable");
    }

    const rows = await db.insert(experience).values({
        userId: current.id,
        companiesId: req.body.companies_id,
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        partTime: req.body.part_time,
        start: toDate(req.body.start),
        end: toDate(req.body.end),
    }).returning();

    res.status(201).json(rows[0]);

    next();
}

export async function patchExperience(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    const experienceId = parseParam(req.params.experienceId, "Identifiant d'expérience invalide");

    if (!validateJson(schemas.patchExperienceSchema, req, res)) {
        return;
    }

    const row = await db.query.experience.findFirst({
        where: eq(experience.id, experienceId),
    });
    if (!row) {
        throw new HttpError(404, "Expérience introuvable");
    }

    checkOwner(row.userId, current.rank, current.id, "Cette expérience ne vous appartient pas");

    const values: ExperienceValues = {};
    if (req.body.companies_id !== undefined) {
        const company = await db.query.companies.findFirst({
            where: eq(companies.id, req.body.companies_id),
        });
        if (!company) {
            throw new HttpError(404, "Entreprise introuvable");
        }
        values.companiesId = req.body.companies_id;
    }
    if (req.body.name !== undefined)
        values.name = req.body.name;
    if (req.body.description !== undefined)
        values.description = req.body.description;
    if (req.body.type !== undefined)
        values.type = req.body.type;
    if (req.body.part_time !== undefined)
        values.partTime = req.body.part_time;
    if (req.body.start !== undefined)
        values.start = toDate(req.body.start);
    if (req.body.end !== undefined)
        values.end = toDate(req.body.end);
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    const rows = await db.update(experience)
        .set(values)
        .where(eq(experience.id, experienceId))
        .returning();

    res.json(rows[0]);

    next();
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    const experienceId = parseParam(req.params.experienceId, "Identifiant d'expérience invalide");

    const row = await db.query.experience.findFirst({
        where: eq(experience.id, experienceId),
    });
    if (!row) {
        throw new HttpError(404, "Expérience introuvable");
    }

    checkOwner(row.userId, current.rank, current.id, "Cette expérience ne vous appartient pas");

    await db.delete(experience).where(eq(experience.id, experienceId));

    res.json({message: "Expérience supprimée"});

    next();
}

export async function getAvailability(req: Request, res: Response, next: NextFunction)
{
    const userId = await resolveUserId(req);

    const list = await db.query.availability.findMany({
        where: eq(availability.userId, userId),
    });

    res.json(list);

    next();
}

export async function postAvailability(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    if (!validateJson(schemas.postAvailabilitySchema, req, res)) {
        return;
    }

    const start = toDate(req.body.start);
    if (start === undefined) {
        throw new HttpError(400, "Le champ start est obligatoire");
    }

    const rows = await db.insert(availability).values({
        userId: current.id,
        title: req.body.title,
        type: req.body.type,
        partTime: req.body.part_time,
        start: start,
        end: toDate(req.body.end),
    }).returning();

    res.status(201).json(rows[0]);

    next();
}

export async function patchAvailability(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    const availabilityId = parseParam(req.params.availabilityId, "Identifiant de disponibilité invalide");

    if (!validateJson(schemas.patchAvailabilitySchema, req, res)) {
        return;
    }

    const row = await db.query.availability.findFirst({
        where: eq(availability.id, availabilityId),
    });
    if (!row) {
        throw new HttpError(404, "Disponibilité introuvable");
    }

    checkOwner(row.userId, current.rank, current.id, "Cette disponibilité ne vous appartient pas");

    const values: AvailabilityValues = {};
    if (req.body.title !== undefined)
        values.title = req.body.title;
    if (req.body.type !== undefined)
        values.type = req.body.type;
    if (req.body.part_time !== undefined)
        values.partTime = req.body.part_time;
    if (req.body.start !== undefined)
        values.start = toDate(req.body.start);
    if (req.body.end !== undefined)
        values.end = toDate(req.body.end);
    if (Object.keys(values).length === 0)
        throw new HttpError(400, "Aucun champ à mettre à jour");

    const rows = await db.update(availability)
        .set(values)
        .where(eq(availability.id, availabilityId))
        .returning();

    res.json(rows[0]);

    next();
}

export async function deleteAvailability(req: Request, res: Response, next: NextFunction)
{
    const current = await getCurrentUser(req);

    const availabilityId = parseParam(req.params.availabilityId, "Identifiant de disponibilité invalide");

    const row = await db.query.availability.findFirst({
        where: eq(availability.id, availabilityId),
    });
    if (!row) {
        throw new HttpError(404, "Disponibilité introuvable");
    }

    checkOwner(row.userId, current.rank, current.id, "Cette disponibilité ne vous appartient pas");

    await db.delete(availability).where(eq(availability.id, availabilityId));

    res.json({message: "Disponibilité supprimée"});

    next();
}
