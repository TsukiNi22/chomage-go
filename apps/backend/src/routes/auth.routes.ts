import {Router} from "express";
import {requireAuthHeader} from "../middlewares/requireAuthHeader.middleware.ts"
import * from "../controllers/auth.controller.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", requireAuthHeader, logout);
router.get("/me", requireAuthHeader, me);

export default router;
