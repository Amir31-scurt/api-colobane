import { Worker } from "bullmq";
import { bullConnection } from "../bullmqConnection";
import type { PushSendJobData } from "../jobTypes";
import { prisma } from "../../prisma/prismaClient";
import { sendExpoPushToUser } from "../../../core/services/push/expoPushService";

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
