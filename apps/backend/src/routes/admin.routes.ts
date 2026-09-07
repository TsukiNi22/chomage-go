import {Router} from "express";
import {requireAuth} from "../middlewares/requireAuth.middleware.ts"
import * as adminController from "../controllers/admin.controller.ts";

const router = Router();

/**
 * @openapi
 * /admin/metrics:
 *   get:
 *     summary: Global platform metrics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated counts and breakdowns
 *       403:
 *         description: Admin access required
 */
router.get("/metrics", requireAuth, adminController.getMetrics);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List all users with moderation state (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get("/users", requireAuth, adminController.getUsers);

/**
 * @openapi
 * /admin/users/{id}/moderation:
 *   patch:
 *     summary: Suspend, reactivate or ban a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [suspend, reactivate, ban]
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: User moderation state updated
 *       400:
 *         description: Cannot moderate your own account
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.patch("/users/:id/moderation", requireAuth, adminController.patchModeration);

/**
 * @openapi
 * /admin/jobs/{id}:
 *   delete:
 *     summary: Delete any job, regardless of owning company (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Job deleted
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Job not found
 */
router.delete("/jobs/:id", requireAuth, adminController.deleteAnyJob);

export default router;
