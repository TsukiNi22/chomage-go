import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import * from "../controllers/users.controller.ts";

const router = Router();

router.get("/:id", getUser);
router.patch("/:id", requireAuthHeader, patchUser);
router.delete("/:id", requireAuthHeader, deleteUser);

router.get("/:id/skills", getSkill);
router.post("/:id/skills", requireAuthHeader, postSkill);
router.patch("/:id/skills/:skillId", requireAuthHeader, patchSkill);
router.delete("/:id/skills/:skillId", requireAuthHeader, deleteSkill);

router.get("/:id/experience", getExperience);
router.post("/:id/experience", requireAuthHeader, postExperience);
router.patch("/:id/experience/experienceId", requireAuthHeader, patchExperience);
router.delete("/:id/experience/experienceId", requireAuthHeader, deleteExperience);

router.get("/:id/availability", getAvailability);
router.post("/:id/availability", requireAuthHeader, postAvailability);
router.patch("/:id/availability/availabilityId", requireAuthHeader, patchAvailability);
router.delete("/:id/availability/availabilityId", requireAuthHeader, deleteAvailability);

export default router;
