import {Request, Response, NextFunction} from "express";
import {z} from "zod";
import {validateJson} from "../utils/validateJson.utils";
import {loginSchema, registerSchema, logoutSchema, meSchema} from "../schemas/auth.schema";

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(loginSchema, req, res)) {
            return next();
        }
    } catch (error) {
        next(error);
    }

    next();
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(registerSchema, req, res)) {
            return next();
        }
    } catch (error) {
        next(error);
    }
    next();
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(logoutSchema, req, res)) {
            return next();
        }
    } catch (error) {
        next(error);
    }
    next();
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(meSchema, req, res)) {
            return next();
        }
    } catch (error) {
        next(error);
    }
    next();
}
