import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import * from "../controllers/compagnies.controller.ts";

const router = Router();

router.get("/compagnies", getCompagnies);
router.get("/compagnies/:id", getCompagnie);
router.post("/compagnies", requireAuthHeader, postCompagnie);
router.patch("/compagnies/:id", requireAuthHeader, patchCompagnie);
router.delete("/compagnies/:id", requireAuthHeader, deleteCompagnie);

export default router;
