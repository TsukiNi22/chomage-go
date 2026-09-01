import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {
    patchUserSchema,
    postSkillSchema, patchSkillSchema,
    postExperienceSchema, patchExperienceSchema,
    postAvailabilitySchema, patchAvailabilitySchema,
} from "../schemas/users.schema";

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - récupérer l'user par id
        // TODO: throw - si user introuvable -> erreur (404)
        // TODO: res.json({...}) - renvoyer l'user (sans le password)

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchUser(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchUserSchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id est bien présent/valide
        // TODO: check - vérifier que l'user connecté (requireAuthHeader) est bien le propriétaire du profil
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - vérifier que l'user existe
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: DB call - mettre à jour l'user
        // TODO: res.json({...}) - renvoyer l'user mis à jour

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: check - vérifier que l'user connecté est bien le propriétaire (ou admin)
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - vérifier que l'user existe
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: DB call - supprimer l'user (+ cascade ? applications, skills, etc.)
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}

// --- skills ---

export async function getSkill(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - vérifier que l'user existe
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: DB call - récupérer les skills de l'user
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

        // TODO: check - req.params.id est bien présent/valide
        // TODO: check - vérifier que l'user connecté est bien le propriétaire du profil
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - créer la skill liée à l'user
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

        // TODO: check - req.params.id et req.params.skillId sont présents/valides
        // TODO: DB call - vérifier que la skill existe et appartient bien à l'user
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user connecté est bien le propriétaire
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
        // TODO: check - req.params.id et req.params.skillId sont présents/valides
        // TODO: DB call - vérifier que la skill existe et appartient bien à l'user
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user connecté est bien le propriétaire
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - supprimer la skill
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}

// --- experience ---

export async function getExperience(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - vérifier que l'user existe
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: DB call - récupérer les expériences de l'user
        // TODO: res.json({...}) - renvoyer la liste des expériences

    } catch (error) {
        next(error);
    }
    next();
}

export async function postExperience(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postExperienceSchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id est bien présent/valide
        // TODO: check - vérifier que l'user connecté est bien le propriétaire du profil
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - créer l'expérience liée à l'user
        // TODO: res.json({...}) - renvoyer l'expérience créée

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchExperience(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchExperienceSchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id et req.params.experienceId sont présents/valides
        // TODO: DB call - vérifier que l'expérience existe et appartient bien à l'user
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user connecté est bien le propriétaire
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - mettre à jour l'expérience
        // TODO: res.json({...}) - renvoyer l'expérience mise à jour

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id et req.params.experienceId sont présents/valides
        // TODO: DB call - vérifier que l'expérience existe et appartient bien à l'user
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user connecté est bien le propriétaire
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - supprimer l'expérience
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}

// --- availability ---

export async function getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id est bien présent/valide
        // TODO: DB call - vérifier que l'user existe
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: DB call - récupérer les disponibilités de l'user
        // TODO: res.json({...}) - renvoyer la liste des disponibilités

    } catch (error) {
        next(error);
    }
    next();
}

export async function postAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(postAvailabilitySchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id est bien présent/valide
        // TODO: check - vérifier que l'user connecté est bien le propriétaire du profil
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - créer la disponibilité liée à l'user
        // TODO: res.json({...}) - renvoyer la disponibilité créée

    } catch (error) {
        next(error);
    }
    next();
}

export async function patchAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(patchAvailabilitySchema, req, res)) {
            return next();
        }

        // TODO: check - req.params.id et req.params.availabilityId sont présents/valides
        // TODO: DB call - vérifier que la disponibilité existe et appartient bien à l'user
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user connecté est bien le propriétaire
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - mettre à jour la disponibilité
        // TODO: res.json({...}) - renvoyer la disponibilité mise à jour

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        // TODO: check - req.params.id et req.params.availabilityId sont présents/valides
        // TODO: DB call - vérifier que la disponibilité existe et appartient bien à l'user
        // TODO: throw - si introuvable -> erreur (404)
        // TODO: check - vérifier que l'user connecté est bien le propriétaire
        // TODO: throw - si pas autorisé -> erreur (403)
        // TODO: DB call - supprimer la disponibilité
        // TODO: res.json({...}) - confirmer la suppression

    } catch (error) {
        next(error);
    }
    next();
}
