import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.js";
import {HttpError} from "../types/httpError.js";
import * as schemas from "../schemas/companies.schema.js";

export function getCompanies(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function getCompanie(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function postCompanie(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function patchCompanie(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteCompanie(req: Request, res: Response, next: NextFunction)
{
    next();
}
