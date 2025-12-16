import { Worker } from "bullmq";
import { bullConnection } from "../bullmqConnection.ts";
import type { PushSendJobData } from "../jobTypes.ts";
import { prisma } from "../../prisma/prismaClient.ts";
import { sendExpoPushToUser } from "../../../core/services/push/expoPushService.ts";

const concurrency = Number(process.env.JOBS_CONCURRENCY || 5);

export const pushWorker = new Worker<PushSendJobData>(
  "pushQueue",
  async (job) => {
    if (job.name !== "push:send") return;

    const notif = await prisma.notification.findUnique({
      where: { id: job.data.notificationId }
    });

    if (!notif) return;

    await sendExpoPushToUser(
      notif.userId,
      notif.title,
      notif.message,
      { notificationId: notif.id, type: notif.type, ...(notif.metadata as any) }
    );
  },
  { ...bullConnection, concurrency }
);
