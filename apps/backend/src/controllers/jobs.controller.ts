import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.js";
import {HttpError} from "../types/httpError.js";
import * as schemas from "../schemas/jobs.schema.js";

export function getJobs(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function getJob(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postJob(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchJob(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteJob(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function getSkills(req: Request, res: Response, next: NextFunction)
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
