import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../types/httpError";
import * as schemas from "../schemas/applications.schema";

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
