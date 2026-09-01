import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import * from "../controllers/applications.controller.ts";

const router = Router();

router.post("/applications", requireAuthHeader, postApplication);
router.get("/applications", requireAuthHeader, gatApplication);
router.delete("/applications/:id", requireAuthHeader, deleteApplication);

export default router;
