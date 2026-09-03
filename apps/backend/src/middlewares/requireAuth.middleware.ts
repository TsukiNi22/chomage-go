import {Request, Response, NextFunction} from "express";
import {auth} from "../lib/auth";
import {fromNodeHeaders} from "better-auth/node";
import {HttpError} from "../types/httpError";

declare global {
    namespace Express {
        interface Request {
            user?: typeof auth.$Infer.Session.user;
            session?: typeof auth.$Infer.Session.session;
        }
    }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction)
{
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
        throw new HttpError(401, "Non authentifié");
    }

    req.user = session.user;
    req.session = session.session;
    next();
}
