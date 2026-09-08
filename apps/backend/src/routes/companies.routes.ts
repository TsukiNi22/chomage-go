import {Router} from "express";
import {requireAuth} from "../middlewares/requireAuth.middleware.ts"
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
router.get("/", companiesController.getCompanies);

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
router.get("/:id", companiesController.getCompanie);

/**
 * @openapi
 * /companies/siret/{siret}:
 *   get:
 *     summary: Look up an establishment in the public Sirene directory
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: siret
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Establishment found
 *       400:
 *         description: Invalid SIRET
 *       404:
 *         description: No establishment matches this SIRET
 *       503:
 *         description: Sirene directory unreachable
 */
router.get("/siret/:siret", companiesController.getSiret);

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
router.post("/", requireAuth, companiesController.postCompanie);

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
router.patch("/:id", requireAuth, companiesController.patchCompanie);

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
/**
 * @openapi
 * /companies/{id}/refresh:
 *   post:
 *     summary: Re-sync legal data from the Sirene directory
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
 *         description: Company updated from Sirene
 *       403:
 *         description: You do not manage this company
 *       404:
 *         description: Company not found
 */
router.post("/:id/refresh", requireAuth, companiesController.refreshCompanie);

router.delete("/:id", requireAuth, companiesController.deleteCompanie);

export default router;
