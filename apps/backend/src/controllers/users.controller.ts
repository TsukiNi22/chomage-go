import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.js";
import {HttpError} from "../types/httpError.js";
import {db} from "../db/index.js";
import {users} from "../db/schema.js";
import {eq} from "drizzle-orm";
import * as schemas from "../schemas/users.schema.js";

export async function getUser(req: Request, res: Response, next: NextFunction)
{
    if (!req.user) {
        return res.status(401).json({ error: "Non authentifié" });
    }

    // Determine user
    let id = Number(req.params.id);
    if (isNaN(id)) id = Number(req.user.id);
    const isSelf = (id === Number(req.user.id));

    // Get asked user
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
        },
    });
    if (!user) throw new HttpError(404, "Utilisateur introuvable");

    // Parse it into json format
    res.json(user);

    next();
}

export function patchUser(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteUser(req: Request, res: Response, next: NextFunction)
{
    next();
}

// --- skills ---
export function getSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

// --- experience ---
export function getExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

// --- availability ---
export function getAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}
