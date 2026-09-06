import {Request, Response, NextFunction} from "express";
import {validateJson} from "../utils/validateJson.utils.js";
import {HttpError} from "../types/httpError.js";
import * as schemas from "../schemas/auth.schema.js";

export function register(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function login(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function logout(req: Request, res: Response, next: NextFunction)
{
    next();
}

export function me(req: Request, res: Response, next: NextFunction)
{
    next();
}
