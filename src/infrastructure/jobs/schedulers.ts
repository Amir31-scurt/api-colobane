import { adminQueue } from "./queues";

export async function registerSchedulers() {
  const cron = process.env.ADMIN_ALERTS_CRON!;
  const adminUserId = Number(process.env.ADMIN_ALERTS_ADMIN_USER_ID || 1);

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
