import {Router} from "express";
import authRoutes from "./auth.routes.ts";

// Init router
export const router = Router();

// Link routes
router.use("/auth", authRoutes);

/*
import usersRoutes from "./users.routes.ts";
import companiesRoutes from "./companies.routes.ts";
import jobsRoutes from "./jobs.routes.ts";
import applicationsRoutes from "./applications.routes.ts";

// Init router
export const router = Router();

// Link routes
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/companies", companiesRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
*/
