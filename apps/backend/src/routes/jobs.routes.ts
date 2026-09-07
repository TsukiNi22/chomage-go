import {Router} from "express";
import {requireAuth} from "../middlewares/requireAuth.middleware.ts"
import * as jobsController from "../controllers/jobs.controller.ts";

const router = Router();

/**
 * @openapi
 * /jobs:
 *   get:
 *     summary: List jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get("/", jobsController.getJobs);

/**
 * @openapi
 * /jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Job data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Job"
 *       404:
 *         description: Job not found
 */
router.get("/:id", jobsController.getJob);

/**
 * @openapi
 * /jobs:
 *   post:
 *     summary: Create a job offer
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companies_id, title, type]
 *             properties:
 *               companies_id: { type: integer }
 *               title: { type: string }
 *               description: { type: string }
 *               type:
 *                 type: integer
 *                 description: "0 stage, 1 alternance, ..."
 *               salary_min: { type: number }
 *               salary_max: { type: number }
 *     responses:
 *       201:
 *         description: Job created
 *       401:
 *         description: Missing or invalid auth header
 */
router.post("/", requireAuth, jobsController.postJob);

/**
 * @openapi
 * /jobs/{id}:
 *   patch:
 *     summary: Update a job offer
 *     tags: [Jobs]
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
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               type: { type: integer }
 *               salary_min: { type: number }
 *               salary_max: { type: number }
 *     responses:
 *       200:
 *         description: Job updated
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Job not found
 */
router.patch("/:id", requireAuth, jobsController.patchJob);

/**
 * @openapi
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job offer
 *     tags: [Jobs]
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
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Job not found
 */
router.delete("/:id", requireAuth, jobsController.deleteJob);

/**
 * @openapi
 * /jobs/{id}/skills:
 *   get:
 *     summary: List skills required for a job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of job skills
 *       404:
 *         description: Job not found
 */
router.get("/:id/skills", jobsController.getSkills);

/**
 * @openapi
 * /jobs/{id}/skills:
 *   post:
 *     summary: Add a required skill to a job
 *     tags: [Jobs]
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
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Skill added
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Job not found
 */
router.post("/:id/skills", requireAuth, jobsController.postSkill);

/**
 * @openapi
 * /jobs/{id}/skills/{skillId}:
 *   patch:
 *     summary: Update a job skill
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Skill updated
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Job or skill not found
 */
router.patch("/:id/skills/:skillId", requireAuth, jobsController.patchSkill);

/**
 * @openapi
 * /jobs/{id}/skills/{skillId}:
 *   delete:
 *     summary: Remove a job skill
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Skill deleted
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Job or skill not found
 */
router.delete("/:id/skills/:skillId", requireAuth, jobsController.deleteSkill);

/**
 * @openapi
 * /jobs/{id}/applications:
 *   get:
 *     summary: List applicants for a job (employer of the owning company only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of applications with applicant profiles
 *       401:
 *         description: Missing or invalid auth header
 *       403:
 *         description: Job does not belong to your company
 *       404:
 *         description: Job not found
 */
router.get("/:id/applications", requireAuth, jobsController.getJobApplications);

export default router;
