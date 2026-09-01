import {Router} from "express";
import {validateJson} from "../middlewares/validateJson.middleware";
import {loginSchema} from "../schemas/auth.schema";
import {login} from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
//router.get("/me", requireAuthHeader, getMe);

export default router;
