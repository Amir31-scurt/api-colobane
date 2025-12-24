import { adminQueue, reportQueue } from "./queues";

export async function registerSchedulers() {
  const cron = process.env.ADMIN_ALERTS_CRON!;
  const adminUserId = Number(process.env.ADMIN_ALERTS_ADMIN_USER_ID || 1);

  if (adminQueue) {
    await adminQueue.add(
      "admin:dailyAlerts",
      { adminUserId },
      {
        repeat: { pattern: cron },
        jobId: `admin:dailyAlerts:${adminUserId}`,
        removeOnComplete: true,
        removeOnFail: false
      }
    );
  }

  if (reportQueue) {
    await reportQueue.add(
      "report:monthly",
      {},
      {
        repeat: { pattern: "0 0 1 * *" }, // First day of every month at midnight
        jobId: "report:monthly",
        removeOnComplete: true,
      }
    );
  }
}
