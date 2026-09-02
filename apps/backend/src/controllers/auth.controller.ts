import {Request, Response, NextFunction} from "express";
import bcrypt from "bcrypt";
import {randomBytes} from "crypto";
import {validateJson} from "../utils/validateJson.utils";
import {HttpError} from "../middlewares/httpError";
import {loginSchema, registerSchema} from "../schemas/auth.schema";

const TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(registerSchema, req, res)) {
            return next();
        }

        const {firstname, lastname, email, email_contact, password, address, description} = req.body;

        // TODO: DB - check unique(email) : const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
        // if (existing) throw new HttpError(409, "email already used");

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // TODO: DB - INSERT INTO users (rank, firstname, lastname, email, email_contact, password_hash, address, description, created_at)
        // VALUES (2, firstname, lastname, email, email_contact ?? null, password_hash, address ?? null, description ?? null, Date.now())
        // const userId = result.lastInsertRowid;
        const userId: any = undefined; // placeholder

        const token = randomBytes(32).toString("hex");
        const expire_at = Date.now() + TOKEN_EXPIRATION_MS;
        // TODO: DB - db.prepare("INSERT INTO tokens (user_id, token, created_at, expire_at) VALUES (?, ?, ?, ?)").run(userId, token, Date.now(), expire_at);

        res.status(201).json({
            id: userId,
            firstname,
            lastname,
            email,
            token,
        });

    } catch (error) {
        next(error);
    }
    next();
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        if (!validateJson(loginSchema, req, res)) {
            return next();
        }

        const {email, password} = req.body;

        // TODO: DB - const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
        const user: any = undefined; // placeholder

        if (!user) {
            throw new HttpError(401, "invalid credentials");
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            throw new HttpError(401, "invalid credentials");
        }

        const token = randomBytes(32).toString("hex");
        const expire_at = Date.now() + TOKEN_EXPIRATION_MS;
        // TODO: DB - db.prepare("INSERT INTO tokens (user_id, token, created_at, expire_at) VALUES (?, ?, ?, ?)").run(user.id, token, Date.now(), expire_at);

        res.json({
            token,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                rank: user.rank,
            },
        });

    } catch (error) {
        next(error);
    }
    next();
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        // pas de body à valider ici, le token vient du header (requireAuthHeader)

        if (!req.token) {
            throw new HttpError(401, "not authenticated");
        }

        // TODO: DB - db.prepare("DELETE FROM tokens WHERE token = ?").run(req.token);

        res.status(204).send();

    } catch (error) {
        next(error);
    }
    next();
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        // pas de body à valider ici, le token vient du header

        if (!req.userId) {
            throw new HttpError(401, "not authenticated");
        }

        // TODO: DB - const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
        const user: any = undefined; // placeholder

        if (!user) {
            throw new HttpError(404, "user not found");
        }

        res.json({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            rank: user.rank,
            companies_id: user.companies_id,
        });

    } catch (error) {
        next(error);
    }
    next();
}
