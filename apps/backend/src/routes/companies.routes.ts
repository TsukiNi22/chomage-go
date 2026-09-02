import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import {getCompagnies, getCompagnie, postCompagnie, patchCompagnie, deleteCompagnie} from "../controllers/companies.controller.ts";

const router = Router();

router.get("/companies", getCompagnies);
router.get("/companies/:id", getCompagnie);
router.post("/companies", requireAuthHeader, postCompagnie);
router.patch("/companies/:id", requireAuthHeader, patchCompagnie);
router.delete("/companies/:id", requireAuthHeader, deleteCompagnie);

export default router;
