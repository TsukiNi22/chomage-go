import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {postApplicationSchema} from "../schemas/applications.schema";

export async function postApplication(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postApplicationSchema, req, res)) {
            return next();
        }

        // TODO: check - récupérer l'id de l'user via requireAuthHeader (ex: req.user.id)
        // TODO: DB call - vérifier que le job (req.body.jobId) existe
        // TODO: throw - si job introuvable -> erreur (404)
        // TODO: check - vérifier que l'user n'a pas déjà postulé à ce job
        // TODO: throw - si déjà postulé -> erreur "already applied" (409)
        // TODO: DB call - créer l'application (userId + jobId)
        // TODO: res.json({...}) - renvoyer l'application créée

    } catch (error) {
        next(error);
    }
    next();
}

export async function getApplication(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - récupérer l'id de l'user via requireAuthHeader
        // TODO: DB call - récupérer les applications de l'user (ou toutes si admin ?)
        // TODO: res.json({...}) - renvoyer la liste des applications

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: check - récupérer l'id de l'user via requireAuthHeader
        // TODO: DB call - vérifier que l'application existe
        // TODO: throw - si application introuvable -> erreur (404)
        // TODO: check - vérifier que l'application appartient bien à l'user (ou est admin)
        // TODO: throw - si pas le propriétaire -> erreur (403)
        // TODO: DB call - supprimer l'application
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}
