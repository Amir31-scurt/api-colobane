import { Worker } from "bullmq";
import { bullConnection } from "../bullmqConnection.ts";
import type { AdminDailyAlertsJobData } from "../jobTypes.ts";
import { getAdminAlertsUsecase } from "../../../core/usecases/admin/getAdminAlertsUsecase.ts";
import { sendNotification } from "../../../core/services/notificationService.ts";

export const adminWorker = new Worker<AdminDailyAlertsJobData>(
  "adminQueue",
  async (job) => {
    if (job.name !== "admin:dailyAlerts") return;

    const alerts = await getAdminAlertsUsecase();

    const title = "Rapport quotidien — Alertes";
    const message = `Cash en attente: ${alerts.cashPendingCount} | Stock faible: ${alerts.lowStockCount}`;

    await sendNotification({
      userId: job.data.adminUserId,
      type: "ADMIN_DAILY_ALERTS",
      title,
      message,
      metadata: alerts
    });
  },
  { ...bullConnection, concurrency: 2 }
);
