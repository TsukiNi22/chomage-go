import {Request} from "express";
import {fromNodeHeaders} from "better-auth/node";
import {auth} from "../lib/auth.ts";
import {db} from "../db/index.ts";
import {users} from "../db/schema.ts";
import {eq} from "drizzle-orm";

/**
 * Lit l'utilisateur courant sur une route publique, sans jamais échouer.
 * Sert à décider ce qu'un visiteur voit : les administrateurs conservent l'accès
 * aux entreprises, offres et profils retirés de la diffusion publique.
 */
export async function getOptionalUser(req: Request)
{
    let session;
    try {
        session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
    } catch {
        return null;
    }

    if (!session) {
        return null;
    }

    const id = Number(session.user.id);
    if (isNaN(id)) {
        return null;
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, id),
    });
    if (!user) {
        return null;
    }

    return user;
}

export function isModerated(row: {
    suspendedAt: Date | null;
    bannedAt: Date | null;
}): boolean
{
    return row.suspendedAt !== null || row.bannedAt !== null;
}
