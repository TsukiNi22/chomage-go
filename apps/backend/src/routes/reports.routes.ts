import {Router} from "express";
import {requireAuth} from "../middlewares/requireAuth.middleware.ts"
import * as reportsController from "../controllers/reports.controller.ts";

const router = Router();

/**
 * @openapi
 * /reports:
 *   post:
 *     summary: Report a job offer or a candidate profile
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               job_id: { type: integer }
 *               user_id: { type: integer }
 *               reason:
 *                 type: string
 *                 enum: [offre-frauduleuse, contenu-discriminatoire, contenu-inapproprie, usurpation, spam, autre]
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Report registered
 *       400:
 *         description: Invalid target
 *       409:
 *         description: Already reported and still under review
 */
router.post("/", requireAuth, reportsController.postReport);

/**
 * @openapi
 * /reports:
 *   get:
 *     summary: List the reports filed by the current user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get("/", requireAuth, reportsController.getMyReports);

export default router;
