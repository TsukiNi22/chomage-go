import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {postJobSchema, patchJobSchema, postSkillSchema, patchSkillSchema} from "../schemas/jobs.schema";

export async function getJobs(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: DB call - récupérer tous les jobs (avec filtres/pagination ? géoloc ?)
        // TODO: res.json({...}) - renvoyer la liste des jobs

    } catch (error) {
        next(error);
    }
    next();
}

export async function getJob(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - récupérer le job par id
        // TODO: throw - si job introuvable -> erreur (404)
        // TODO: res.json({...}) - renvoyer le job

    } catch (error) {
        next(error);
    }
    next();
}

export async function postJob(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postJobSchema, req, res)) {
            return next();
        }

        // TODO: check - l'id de l'user vient de requireAuthHeader (ex: req.user.id)
        // TODO: check - vérifier que l'user a le droit de poster un job (compagnie liée, rôle ?)
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - créer le job
        // TODO: res.json({...}) - renvoyer le job créé

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchJob(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchJobSchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - vérifier que le job existe
        // TODO: throw - si job introuvable -> erreur (404)
        // TODO: check - vérifier que l'user est bien propriétaire/admin de ce job
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - mettre à jour le job
        // TODO: res.json({...}) - renvoyer le job mis à jour

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - vérifier que le job existe
        // TODO: throw - si job introuvable -> erreur (404)
        // TODO: check - vérifier que l'user est bien propriétaire/admin de ce job
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - supprimer le job
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}

export async function getSkills(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id (jobId) est bien présent/valide
        // TODO: DB call - vérifier que le job existe
        // TODO: throw - si job introuvable -> erreur (404)
        // TODO: DB call - récupérer les skills liées à ce job
        // TODO: res.json({...}) - renvoyer la liste des skills

    } catch (error) {
        next(error);
    }
    next();
}

export async function postSkill(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postSkillSchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id (jobId) est bien présent/valide
        // TODO: DB call - vérifier que le job existe
        // TODO: throw - si job introuvable -> erreur (404)
        // TODO: check - vérifier que l'user est bien propriétaire/admin de ce job
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - créer la skill liée au job
        // TODO: res.json({...}) - renvoyer la skill créée

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchSkill(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchSkillSchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id (jobId) et req.params.skillId sont présents/valides
        // TODO: DB call - vérifier que la skill existe et appartient bien au job
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user est bien propriétaire/admin de ce job
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - mettre à jour la skill
        // TODO: res.json({...}) - renvoyer la skill mise à jour

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id (jobId) et req.params.skillId sont présents/valides
        // TODO: DB call - vérifier que la skill existe et appartient bien au job
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user est bien propriétaire/admin de ce job
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - supprimer la skill
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}
