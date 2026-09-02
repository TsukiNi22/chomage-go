import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import * as schemas from "../schemas/users.schema";

export function getUser(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchUser(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteUser(req: Request, res: Response, next: NextFunction)
{
    next();
}

// --- skills ---
export function getSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteSkill(req: Request, res: Response, next: NextFunction)
{
    next();
}

// --- experience ---
export function getExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteExperience(req: Request, res: Response, next: NextFunction)
{
    next();
}

// --- availability ---
export function getAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteAvailability(req: Request, res: Response, next: NextFunction)
{
    next();
}
