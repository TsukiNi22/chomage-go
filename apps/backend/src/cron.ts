import cron from "node-cron";
import {runDailyMaintenance} from "./db/maintenance";

// minute hour day-month month day-week
cron.schedule("0 0 * * *", async () => {
    console.log("[cron] Début de la maintenance quotidienne");
    try {
        await runDailyMaintenance();
        console.log("[cron] Maintenance terminée");
    } catch (err) {
        console.error("[cron] Échec de la maintenance :", err);
    }
}, {
    timezone: "Europe/Paris",
});

console.log("[cron] Job de maintenance planifié (tous les jours à: 0h 0m 0s)");
