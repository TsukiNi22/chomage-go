import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import * as schemas from "../schemas/jobs.schema";

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
