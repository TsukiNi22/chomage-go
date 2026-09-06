import {Router} from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import companiesRoutes from "./companies.routes.js";
import jobsRoutes from "./jobs.routes.js";
import applicationsRoutes from "./applications.routes.js";
import specialRoutes from "./special.routes.js";

// Init router
export const router = Router();

// Link routes
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/companies", companiesRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("", specialRoutes);
