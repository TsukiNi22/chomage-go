import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import * as schemas from "../schemas/companies.schema";

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
