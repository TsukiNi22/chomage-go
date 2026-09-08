import {Request} from "express";
import {HttpError} from "../types/httpError.ts";
import {db} from "../db/index.ts";
import {users} from "../db/schema.ts";
import {eq} from "drizzle-orm";

export async function getCurrentUser(req: Request)
{
    if (!req.user) {
        throw new HttpError(401, "Non authentifié");
    }

    const id = Number(req.user.id);
    if (isNaN(id)) {
        throw new HttpError(401, "Non authentifié");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, id),
    });
    if (!user) {
        throw new HttpError(401, "Non authentifié");
    }

    if (user.bannedAt !== null) {
        throw new HttpError(403, "Ce compte a été banni de la plateforme", {
            moderation: {
                state: "banned",
                reason: user.moderationReason,
                since: user.bannedAt,
            },
        });
    }

    if (user.suspendedAt !== null) {
        throw new HttpError(403, "Ce compte est suspendu", {
            moderation: {
                state: "suspended",
                reason: user.moderationReason,
                since: user.suspendedAt,
            },
        });
    }

    return user;
}
