import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.js";
import {HttpError} from "../types/httpError.js";
import * as schemas from "../schemas/applications.schema.js";

export function postApplication(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function getApplication(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function deleteApplication(req: Request, res: Response, next: NextFunction)
{
    next();
}
