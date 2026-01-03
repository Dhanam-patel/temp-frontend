import cron from "node-cron";
import { storage } from "./storage";

export function initializeCronJobs() {
    // Daily reset at midnight (00:00)
    cron.schedule("0 0 * * *", async () => {
        console.log("[cron] Running daily status reset...");
        try {
            await storage.resetAllStatuses();
            console.log("[cron] Daily status reset completed successfully");
        } catch (error) {
            console.error("[cron] Error during daily status reset:", error);
        }
    });

    console.log("[cron] Cron jobs initialized - Daily reset scheduled for midnight");
}
