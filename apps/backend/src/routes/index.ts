import {Router} from "express";
import authRoutes from "./auth.routes";

// Init router
export const router = Router();

// Link routes
router.use("/auth", authRoutes);
