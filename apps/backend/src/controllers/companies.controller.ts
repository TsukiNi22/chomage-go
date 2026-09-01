import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {postCompagnieSchema, patchCompagnieSchema} from "../schemas/compagnies.schema";

export async function getCompagnies(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: DB call - récupérer toutes les compagnies (avec pagination/filtres ?)
        // TODO: res.json({...}) - renvoyer la liste des compagnies

    } catch (error) {
        next(error);
    }
    next();
}

export async function getCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - récupérer la compagnie par id
        // TODO: throw - si compagnie introuvable -> erreur (404)
        // TODO: res.json({...}) - renvoyer la compagnie

    } catch (error) {
        next(error);
    }
    next();
}

export async function postCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postCompagnieSchema, req, res)) {
            return next();
        }

        // TODO: check - l'id de l'user vient de requireAuthHeader (ex: req.user.id)
        // TODO: check - vérifier que l'user a le droit de créer une compagnie (rôle ?)
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - créer la compagnie
        // TODO: res.json({...}) - renvoyer la compagnie créée

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchCompagnieSchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - vérifier que la compagnie existe
        // TODO: throw - si compagnie introuvable -> erreur (404)
        // TODO: check - vérifier que l'user est bien propriétaire/admin de cette compagnie
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - mettre à jour la compagnie
        // TODO: res.json({...}) - renvoyer la compagnie mise à jour

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteCompagnie(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - vérifier que la compagnie existe
        // TODO: throw - si compagnie introuvable -> erreur (404)
        // TODO: check - vérifier que l'user est bien propriétaire/admin de cette compagnie
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - supprimer la compagnie
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}
