import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import {getJobs, getJob, postJob, patchJob, deleteJob, getSkills, postSkill, patchSkill, deleteSkill} from "../controllers/jobs.controller.ts";

const router = Router();

router.get("/jobs", getJobs);
router.get("/jobs/:id", getJob);
router.post("/jobs", requireAuthHeader, postJob);
router.patch("/jobs/:id", requireAuthHeader, patchJob);
router.delete("/jobs/:id", requireAuthHeader, deleteJob);

router.get("/jobs/:id/skills", getSkills);
router.post("/jobs/:id/skills", requireAuthHeader, postSkill);
router.patch("/jobs/:id/skills/:skillId", requireAuthHeader, patchSkill);
router.delete("/jobs/:id/skills/:skillId", requireAuthHeader, deleteSkill);

export default router;
