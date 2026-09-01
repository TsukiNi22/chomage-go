import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import * as companiesController from "../controllers/companies.controller.ts";

const router = Router();

/**
 * @openapi
 * /companies:
 *   get:
 *     summary: List companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of companies
 */
router.get("/companies", companiesController.getCompanies);

/**
 * @openapi
 * /companies/{id}:
 *   get:
 *     summary: Get a company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Company data
 *       404:
 *         description: Company not found
 */
router.get("/companies/:id", companiesController.getCompanie);

/**
 * @openapi
 * /companies:
 *   post:
 *     summary: Create a company
 *     tags: [Companies]
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
 *               employee_range:
 *                 type: integer
 *                 description: "0 -> 0-10, 1 -> 11-100, ..."
 *     responses:
 *       201:
 *         description: Company created
 *       401:
 *         description: Missing or invalid auth header
 *       409:
 *         description: Company name already exists
 */
router.post("/companies", requireAuthHeader, companiesController.postCompanie);

/**
 * @openapi
 * /companies/{id}:
 *   patch:
 *     summary: Update a company
 *     tags: [Companies]
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
 *               name: { type: string }
 *               description: { type: string }
 *               employee_range: { type: integer }
 *     responses:
 *       200:
 *         description: Company updated
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Company not found
 */
router.patch("/companies/:id", requireAuthHeader, companiesController.patchCompanie);

/**
 * @openapi
 * /companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Company deleted
 *       401:
 *         description: Missing or invalid auth header
 *       404:
 *         description: Company not found
 */
router.delete("/companies/:id", requireAuthHeader, companiesController.deleteCompanie);

export default router;
