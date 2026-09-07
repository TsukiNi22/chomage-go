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

    return user;
}
