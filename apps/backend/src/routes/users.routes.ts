import {Router} from "express";
import {requireAuth} from "../middlewares/requireAuth.middleware.ts"
import * as usersController from "../controllers/users.controller.ts";

const router = Router();

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get("/:id", requireAuth, usersController.getUser);
router.get("/", requireAuth, usersController.getUser);

/**
 * @openapi
 * /users/:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
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
 *               firstname: { type: string }
 *               lastname: { type: string }
 *               email: { type: string, format: email }
 *               email_contact: { type: string, format: email }
 *               address: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User not found
 */
router.patch("/", requireAuth, usersController.patchUser);

/**
 * @openapi
 * /users/:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User not found
 */
router.delete("/", requireAuth, usersController.deleteUser);

/**
 * @openapi
 * /users/{id}/skills:
 *   get:
 *     summary: List a user's skills
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of user skills
 *       404:
 *         description: User not found
 */
router.get("/:id/skills", usersController.getSkill);
router.get("/skills", usersController.getSkill);

/**
 * @openapi
 * /users/skills:
 *   post:
 *     summary: Add a skill to a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: User not found
 */
router.post("/skills", requireAuth, usersController.postSkill);

/**
 * @openapi
 * /users/skills/{skillId}:
 *   patch:
 *     summary: Update a user skill
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: User or skill not found
 */
router.patch("/skills/:skillId", requireAuth, usersController.patchSkill);

/**
 * @openapi
 * /users/skills/{skillId}:
 *   delete:
 *     summary: Remove a user skill
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: User or skill not found
 */
router.delete("/skills/:skillId", requireAuth, usersController.deleteSkill);

/**
 * @openapi
 * /users/{id}/experience:
 *   get:
 *     summary: List a user's experience entries
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of experience entries
 *       404:
 *         description: User not found
 */
router.get("/:id/experience", usersController.getExperience);
router.get("/experience", usersController.getExperience);

/**
 * @openapi
 * /users/experience:
 *   post:
 *     summary: Add an experience entry to a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companies_id, name, type, start]
 *             properties:
 *               companies_id: { type: integer }
 *               name: { type: string }
 *               description: { type: string }
 *               type:
 *                 type: integer
 *                 description: "0 stage, 1 alternance, ..."
 *               part_time: { type: boolean }
 *               start: { type: string, format: date }
 *               end: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Experience entry created
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User not found
 */
router.post("/experience", requireAuth, usersController.postExperience);

/**
 * @openapi
 * /users/experience/{experienceId}:
 *   patch:
 *     summary: Update an experience entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: experienceId
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
 *               type: { type: integer }
 *               part_time: { type: boolean }
 *               start: { type: string, format: date }
 *               end: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Experience entry updated
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User or experience entry not found
 */
router.patch("/experience/:experienceId", requireAuth, usersController.patchExperience);

/**
 * @openapi
 * /users/experience/{experienceId}:
 *   delete:
 *     summary: Delete an experience entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Experience entry deleted
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User or experience entry not found
 */
router.delete("/experience/:experienceId", requireAuth, usersController.deleteExperience);

/**
 * @openapi
 * /users/{id}/availability:
 *   get:
 *     summary: List a user's availability entries
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of availability entries
 *       404:
 *         description: User not found
 */
router.get("/:id/availability", usersController.getAvailability);
router.get("/availability", usersController.getAvailability);

/**
 * @openapi
 * /users/availability:
 *   post:
 *     summary: Add an availability entry to a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, start]
 *             properties:
 *               title: { type: string }
 *               type:
 *                 type: integer
 *                 description: "0 stage, 1 alternance, ..."
 *               part_time: { type: boolean }
 *               start: { type: string, format: date }
 *               end: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Availability entry created
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User not found
 */
router.post("/availability", requireAuth, usersController.postAvailability);

/**
 * @openapi
 * /users/availability/{availabilityId}:
 *   patch:
 *     summary: Update an availability entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: availabilityId
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
 *               type: { type: integer }
 *               part_time: { type: boolean }
 *               start: { type: string, format: date }
 *               end: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Availability entry updated
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User or availability entry not found
 */
router.patch("/availability/:availabilityId", requireAuth, usersController.patchAvailability);

/**
 * @openapi
 * /users/availability/{availabilityId}:
 *   delete:
 *     summary: Delete an availability entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: availabilityId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Availability entry deleted
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User or availability entry not found
 */
router.delete("/availability/:availabilityId", requireAuth, usersController.deleteAvailability);

export default router;
