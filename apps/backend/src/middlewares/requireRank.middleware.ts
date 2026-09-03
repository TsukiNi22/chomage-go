import {Request, Response, NextFunction} from "express";

export function requireRank(...allowedRanks: number[])
{
    return (req: Request, res: Response, next: NextFunction) => {
        // not authenificated
        if (!req.user) {
            return res.status(401).json({ error: "Non authentifié" });
        }

        // check the rank
        const userRank = (req.user as any).rank;
        if (!allowedRanks.includes(userRank)) {
            return res.status(403).json({ error: "Accès refusé" });
        }
        next();
    };
}
