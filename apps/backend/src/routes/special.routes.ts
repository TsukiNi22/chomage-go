import {Router} from "express";
import {requireAuth} from "../middlewares/requireAuth.middleware.ts"
import * as specialController from "../controllers/special.controller.ts";

const router = Router();

/**
 * @openapi
 * /extract:
 *   get:
 *     summary: Extract all user data
 *     tags: [Special]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data sended
 *       401:
 *         description: Missing or invalid auth header
 */
router.get("/extract", requireAuth, specialController.extract);

export default router;
