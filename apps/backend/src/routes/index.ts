import {Router} from "express";
import authRoutes from "./auth.routes.ts";
import usersRoutes from "./users.routes.ts";
import companiesRoutes from "./companies.routes.ts";
import jobsRoutes from "./jobs.routes.ts";
import applicationsRoutes from "./applications.routes.ts";
import specialRoutes from "./special.routes.ts";
import reportsRoutes from "./reports.routes.ts";
import adminRoutes from "./admin.routes.ts";

// Init router
export const router = Router();

// Link routes
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/companies", companiesRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/reports", reportsRoutes);
router.use("/admin", adminRoutes);
router.use("", specialRoutes);
