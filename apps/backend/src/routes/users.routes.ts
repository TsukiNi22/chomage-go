import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
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
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get("/:id", usersController.getUser);

/**
 * @openapi
 * /users/{id}:
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
router.patch("/:id", requireAuthHeader, usersController.patchUser);

<<<<<<< HEAD
router.get("/:id/experience", getExperience);
router.post("/:id/experience", requireAuthHeader, postExperience);
router.patch("/:id/experience/:experienceId", requireAuthHeader, patchExperience);
router.delete("/:id/experience/:experienceId", requireAuthHeader, deleteExperience);

router.get("/:id/availability", getAvailability);
router.post("/:id/availability", requireAuthHeader, postAvailability);
router.patch("/:id/availability/:availabilityId", requireAuthHeader, patchAvailability);
router.delete("/:id/availability/:availabilityId", requireAuthHeader, deleteAvailability);
=======
/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: User not found
 */
router.delete("/:id", requireAuthHeader, usersController.deleteUser);

/**
 * @openapi
 * /users/{id}/skills:
 *   get:
 *     summary: List a user's skills
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of user skills
 *       404:
 *         description: User not found
 */
router.get("/:id/skills", usersController.getSkill);

/**
 * @openapi
 * /users/{id}/skills:
 *   post:
 *     summary: Add a skill to a user
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
router.post("/:id/skills", requireAuthHeader, usersController.postSkill);

/**
 * @openapi
 * /users/{id}/skills/{skillId}:
 *   patch:
 *     summary: Update a user skill
 *     tags: [Users]
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
 *         description: User or skill not found
 */
router.patch("/:id/skills/:skillId", requireAuthHeader, usersController.patchSkill);

/**
 * @openapi
 * /users/{id}/skills/{skillId}:
 *   delete:
 *     summary: Remove a user skill
 *     tags: [Users]
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
 *         description: User or skill not found
 */
router.delete("/:id/skills/:skillId", requireAuthHeader, usersController.deleteSkill);

/**
 * @openapi
 * /users/{id}/experience:
 *   get:
 *     summary: List a user's experience entries
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of experience entries
 *       404:
 *         description: User not found
 */
router.get("/:id/experience", usersController.getExperience);

/**
 * @openapi
 * /users/{id}/experience:
 *   post:
 *     summary: Add an experience entry to a user
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
router.post("/:id/experience", requireAuthHeader, usersController.postExperience);

/**
 * @openapi
 * /users/{id}/experience/{experienceId}:
 *   patch:
 *     summary: Update an experience entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
router.patch("/:id/experience/experienceId", requireAuthHeader, usersController.patchExperience);

/**
 * @openapi
 * /users/{id}/experience/{experienceId}:
 *   delete:
 *     summary: Delete an experience entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
router.delete("/:id/experience/experienceId", requireAuthHeader, usersController.deleteExperience);

/**
 * @openapi
 * /users/{id}/availability:
 *   get:
 *     summary: List a user's availability entries
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of availability entries
 *       404:
 *         description: User not found
 */
router.get("/:id/availability", usersController.getAvailability);

/**
 * @openapi
 * /users/{id}/availability:
 *   post:
 *     summary: Add an availability entry to a user
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
router.post("/:id/availability", requireAuthHeader, usersController.postAvailability);

/**
 * @openapi
 * /users/{id}/availability/{availabilityId}:
 *   patch:
 *     summary: Update an availability entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
router.patch("/:id/availability/availabilityId", requireAuthHeader, usersController.patchAvailability);

/**
 * @openapi
 * /users/{id}/availability/{availabilityId}:
 *   delete:
 *     summary: Delete an availability entry
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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
router.delete("/:id/availability/availabilityId", requireAuthHeader, usersController.deleteAvailability);

export default router;
