import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import * as applicationsController from "../controllers/applications.controller.ts";

const router = Router();

/**
 * @openapi
 * /applications:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [job_id]
 *             properties:
 *               job_id: { type: integer }
 *     responses:
 *       201:
 *         description: Application created
 *       401:
 *         description: Missing or invalid auth header
 *       409:
 *         description: Already applied to this job
 */
router.post("/applications", requireAuthHeader, applicationsController.postApplication);

/**
 * @openapi
 * /applications:
 *   get:
 *     summary: Get applications for the authenticated user
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 *       401:
 *         description: Missing or invalid auth header
 */
router.get("/applications", requireAuthHeader, applicationsController.gatApplication);

/**
 * @openapi
 * /applications/{id}:
 *   delete:
 *     summary: Withdraw/delete an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Application deleted
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Application not found
 */
router.delete("/applications/:id", requireAuthHeader, applicationsController.deleteApplication);

export default router;
