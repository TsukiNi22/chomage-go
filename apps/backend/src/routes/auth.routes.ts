import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import * as authController from "../controllers/auth.controller.ts";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstname, lastname, email, password]
 *             properties:
 *               firstname: { type: string }
 *               lastname: { type: string }
 *               email: { type: string, format: email }
 *               email_contact: { type: string, format: email }
 *               password: { type: string, format: password }
 *               address: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already in use
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful, returns auth token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Missing or invalid auth header
 */
router.post("/logout", requireAuthHeader, authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Missing or invalid auth header
 */
router.get("/me", requireAuthHeader, authController.me);

export default router;
