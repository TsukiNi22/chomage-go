import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import {
    patchUserSchema,
    postSkillSchema, patchSkillSchema,
    postExperienceSchema, patchExperienceSchema,
    postAvailabilitySchema, patchAvailabilitySchema,
} from "../schemas/users.schema";

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        const user: any = undefined; // placeholder

        if (!user) {
            throw new HttpError(404, "user not found");
        }

        res.json({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            address: user.address,
            description: user.description,
            resume: user.resume,
            localisation: user.localisation,
            rank: user.rank,
            companies_id: user.companies_id,
        });

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

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
        const existing: any = undefined; // placeholder
        if (!existing) {
            throw new HttpError(404, "user not found");
        }

        // TODO: DB - UPDATE users SET ... WHERE id = ? (avec les champs présents dans req.body)

        res.json({id, ...req.body});

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
        const existing: any = undefined; // placeholder
        if (!existing) {
            throw new HttpError(404, "user not found");
        }

        // TODO: DB - DELETE user (+ cascade tokens, user_skills, experience, availability, applications)

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}

// --- skills ---

export async function getSkill(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - vérifier que l'user existe
        // TODO: DB - const skills = db.prepare("SELECT * FROM user_skills WHERE user_id = ?").all(id);
        const skills: any[] = []; // placeholder

        res.json(skills);

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

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        const {name, description} = req.body;

        // TODO: DB - INSERT INTO user_skills (user_id, name, description) VALUES (?, ?, ?)
        // const skillId = result.lastInsertRowid;

        res.status(201).json({user_id: id, name, description});

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

        const id = Number(req.params.id);
        const skillId = Number(req.params.skillId);
        if (!Number.isInteger(id) || !Number.isInteger(skillId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const skill = db.prepare("SELECT * FROM user_skills WHERE id = ? AND user_id = ?").get(skillId, id);
        const skill: any = undefined; // placeholder
        if (!skill) {
            throw new HttpError(404, "skill not found");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - UPDATE user_skills SET ... WHERE id = ?

        res.json({id: skillId, ...req.body});

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteSkill(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const skillId = Number(req.params.skillId);
        if (!Number.isInteger(id) || !Number.isInteger(skillId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const skill = db.prepare("SELECT * FROM user_skills WHERE id = ? AND user_id = ?").get(skillId, id);
        const skill: any = undefined; // placeholder
        if (!skill) {
            throw new HttpError(404, "skill not found");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - DELETE FROM user_skills WHERE id = ?

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}

// --- experience ---

export async function getExperience(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - vérifier que l'user existe
        // TODO: DB - const experiences = db.prepare("SELECT * FROM experience WHERE user_id = ?").all(id);
        const experiences: any[] = []; // placeholder

        res.json(experiences);

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

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        const {companies_id, name, description, type, part_time, start, end} = req.body;

        if (companies_id) {
            // TODO: DB - vérifier que companies_id existe
            // if (!company) throw new HttpError(404, "company not found");
        }

        // TODO: DB - INSERT INTO experience (user_id, companies_id, name, description, type, part_time, start, end) VALUES (...)

        res.status(201).json({user_id: id, companies_id, name, description, type, part_time, start, end});

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

        const id = Number(req.params.id);
        const experienceId = Number(req.params.experienceId);
        if (!Number.isInteger(id) || !Number.isInteger(experienceId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const experience = db.prepare("SELECT * FROM experience WHERE id = ? AND user_id = ?").get(experienceId, id);
        const experience: any = undefined; // placeholder
        if (!experience) {
            throw new HttpError(404, "experience not found");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - UPDATE experience SET ... WHERE id = ?

        res.json({id: experienceId, ...req.body});

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const experienceId = Number(req.params.experienceId);
        if (!Number.isInteger(id) || !Number.isInteger(experienceId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const experience = db.prepare("SELECT * FROM experience WHERE id = ? AND user_id = ?").get(experienceId, id);
        const experience: any = undefined; // placeholder
        if (!experience) {
            throw new HttpError(404, "experience not found");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - DELETE FROM experience WHERE id = ?

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}

// --- availability ---

export async function getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - vérifier que l'user existe
        // TODO: DB - const availabilities = db.prepare("SELECT * FROM availability WHERE user_id = ?").all(id);
        const availabilities: any[] = []; // placeholder

        res.json(availabilities);

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

        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new HttpError(400, "invalid id");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        const {title, type, part_time, start, end} = req.body;

        // TODO: DB - INSERT INTO availability (user_id, title, type, part_time, start, end) VALUES (...)

        res.status(201).json({user_id: id, title, type, part_time, start, end});

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

        const id = Number(req.params.id);
        const availabilityId = Number(req.params.availabilityId);
        if (!Number.isInteger(id) || !Number.isInteger(availabilityId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const availability = db.prepare("SELECT * FROM availability WHERE id = ? AND user_id = ?").get(availabilityId, id);
        const availability: any = undefined; // placeholder
        if (!availability) {
            throw new HttpError(404, "availability not found");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - UPDATE availability SET ... WHERE id = ?

        res.json({id: availabilityId, ...req.body});

    } catch (error) {
        next(error);
    }
    next();
}

export async function deleteAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const availabilityId = Number(req.params.availabilityId);
        if (!Number.isInteger(id) || !Number.isInteger(availabilityId)) {
            throw new HttpError(400, "invalid id");
        }

        // TODO: DB - const availability = db.prepare("SELECT * FROM availability WHERE id = ? AND user_id = ?").get(availabilityId, id);
        const availability: any = undefined; // placeholder
        if (!availability) {
            throw new HttpError(404, "availability not found");
        }

        if (req.userId !== id) {
            throw new HttpError(403, "not allowed");
        }

        // TODO: DB - DELETE FROM availability WHERE id = ?

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}
