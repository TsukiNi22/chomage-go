import {Router} from "express";
import authRoutes from "./auth.routes.ts";
import usersRoutes from "./users.routes.ts";
import companiesRoutes from "./companies.routes.ts";
import jobsRoutes from "./jobs.routes.ts";
import applicationsRoutes from "./applications.routes.ts";
import specialRoutes from "./special.routes.ts";
import reportsRoutes from "./reports.routes.ts";
import adminRoutes from "./admin.routes.ts";
import {JOBS_CACHE_KEY, invalidatePublicCache} from "../utils/publicCache.utils.ts";

// Init router
export const router = Router();

// La liste publique des offres est memorisee quelques secondes (voir
// publicCache.utils.ts). Toute ecriture reussie peut changer ce que le public
// voit — publication d'une offre, moderation d'un compte ou d'une entreprise —
// donc on purge ici plutot que de dependre d'un appel dans chaque controller.
// L'invalidation a lieu apres la reponse : purger avant l'ecriture laisserait
// une lecture concurrente reremplir le cache avec l'etat d'avant.
router.use((req, res, next) => {
    if (req.method !== "GET") {
        res.on("finish", () => {
            if (res.statusCode < 400) {
                invalidatePublicCache(JOBS_CACHE_KEY);
            }
        });
    }
    next();
});

// Link routes
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/companies", companiesRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/reports", reportsRoutes);
router.use("/admin", adminRoutes);
router.use("", specialRoutes);
