import {Router} from "express";
import authRoutes from "./auth.routes";
import jobsRoutes from "./jobs.routes";
import usersRoutes from "./users.routes";
import companiesRoutes from "./companies.routes";
import applicationsRoutes from "./applications.routes";

// Init router
export const router = Router();

// Link routes
router.use("/auth", authRoutes);

// Jobs routes
router.use("/", jobsRoutes);

// User routes
router.use("/users", usersRoutes);

// Companies routes
router.use("/", companiesRoutes);

// Applications routes
router.use("/", applicationsRoutes);
