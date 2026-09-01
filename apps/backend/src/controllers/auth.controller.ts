import {Request, Response, NextFunction} from "express";
import {z} from "zod";
import {validateJson} from "../utils/validateJson.utils";
import {loginSchema, registerSchema, logoutSchema, meSchema} from "../schemas/auth.schema";

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(loginSchema, req, res)) {
            return next();
        }

        // TODO: DB call - récupérer l'user par email (req.body.email)
        // TODO: check - user existe ?
        // TODO: throw - si user n'existe pas -> erreur "invalid credentials" (401)
        // TODO: check - comparer password (hash) avec celui en DB
        // TODO: throw - si password incorrect -> erreur "invalid credentials" (401)
        // TODO: DB call ou lib - générer le JWT une fois l'user validé
        // TODO: res.json({...}) - renvoyer le JWT + infos user

    } catch (error) {
        next(error);
    }
    next();
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(registerSchema, req, res)) {
            return next();
        }

        // TODO: DB call - check si un user existe déjà avec cet email
        // TODO: throw - si email déjà pris -> erreur "email already used" (409)
        // TODO: hash le password avant stockage
        // TODO: DB call - créer le nouvel user
        // TODO: res.json({...}) - renvoyer l'user créé (sans le password) ou un JWT direct

    } catch (error) {
        next(error);
    }
    next();
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(logoutSchema, req, res)) {
            return next();
        }

        // TODO: check - vérifier la validité du JWT (req.body.jwt)
        // TODO: throw - si JWT invalide/expiré -> erreur (401)
        // TODO: DB call - invalider le JWT/la session (blacklist ou suppression en DB)
        // TODO: res.json({...}) - confirmer le logout

    } catch (error) {
        next(error);
    }
    next();
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(meSchema, req, res)) {
            return next();
        }

        // TODO: check - vérifier la validité du JWT (req.body.jwt)
        // TODO: throw - si JWT invalide/expiré -> erreur (401)
        // TODO: DB call - récupérer l'user via l'id contenu dans le JWT
        // TODO: throw - si user introuvable -> erreur (404)
        // TODO: res.json({...}) - renvoyer les infos de l'user (sans le password)

    } catch (error) {
        next(error);
    }
    next();
}
