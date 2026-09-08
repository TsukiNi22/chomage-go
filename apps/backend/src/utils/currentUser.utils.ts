import {Request} from "express";
import {HttpError} from "../types/httpError.ts";
import {db} from "../db/index.ts";
import {companies, users} from "../db/schema.ts";
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
                source: "account",
            },
        });
    }

    if (user.suspendedAt !== null) {
        throw new HttpError(403, "Ce compte est suspendu", {
            moderation: {
                state: "suspended",
                reason: user.moderationReason,
                since: user.suspendedAt,
                source: "account",
            },
        });
    }

    // Un employeur suit le sort de son entreprise : si celle-ci est suspendue ou bannie,
    // son compte perd les mêmes accès, sans être lui-même marqué en base.
    // Les administrateurs sont exclus de cette règle pour garder la main sur la modération.
    if (user.rank !== 0 && user.companiesId !== null) {
        const company = await db.query.companies.findFirst({
            where: eq(companies.id, user.companiesId),
        });

        if (company && company.bannedAt !== null) {
            throw new HttpError(403, "L'entreprise rattachée à ce compte a été bannie de la plateforme", {
                moderation: {
                    state: "banned",
                    reason: company.moderationReason,
                    since: company.bannedAt,
                    source: "company",
                    companyName: company.name,
                },
            });
        }

        if (company && company.suspendedAt !== null) {
            throw new HttpError(403, "L'entreprise rattachée à ce compte est suspendue", {
                moderation: {
                    state: "suspended",
                    reason: company.moderationReason,
                    since: company.suspendedAt,
                    source: "company",
                    companyName: company.name,
                },
            });
        }
    }

    return user;
}
