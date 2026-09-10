import {Router} from "express";
import * as utilsController from "../controllers/utils.controller.ts";

const router = Router();

/**
 * @openapi
 * /utils/tiles/{z}/{x}/{y}:
 *   get:
 *     summary: Serve an IGN base-map tile through the shared disk cache
 *     tags: [Utils]
 *     parameters:
 *       - in: path
 *         name: z
 *         required: true
 *         schema: { type: integer, minimum: 0, maximum: 19 }
 *       - in: path
 *         name: x
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: y
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: PNG tile. X-Tile-Cache says hit or miss.
 *         content:
 *           image/png: {}
 *       400:
 *         description: Tile coordinates out of range
 *       502:
 *         description: IGN Geoplateforme unreachable
 */
router.get("/tiles/:z/:x/:y", utilsController.getTile);

export default router;
