import {Request, Response, NextFunction} from "express";
import {HttpError} from "./httpError";

export function requireAuthHeader(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({error: "Missing or malformed Authorization header"});
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
        return res.status(401).json({error: "Missing token"});
    }

    try {
        // TODO: DB - const row = db.prepare("SELECT user_id, expire_at FROM tokens WHERE token = ?").get(token);
        const row: any = undefined;

        if (!row) {
            throw new HttpError(401, "invalid token");
        }
        if (row.expire_at < Date.now()) {
            // TODO: DB - db.prepare("DELETE FROM tokens WHERE token = ?").run(token); // cleanup optionnel
            throw new HttpError(401, "token expired");
        }

        req.token = token;
        req.userId = row.user_id;

        next();
    } catch (error) {
        next(error);
    }
}
