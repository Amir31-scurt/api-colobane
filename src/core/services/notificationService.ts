import { PushSendJobData } from "../../infrastructure/jobs/jobTypes.ts";
import { pushQueue } from "../../infrastructure/jobs/queues.ts";
import { prisma } from "../../infrastructure/prisma/prismaClient.ts";
import { sendExpoPush } from "./push/expoPushService.ts";

interface SendNotificationInput {
  userId: number;
  type: string;
  title: string;
  message: string;
  metadata?: any;
}

export async function sendNotification(input: SendNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata ?? {}
    }
  });

  // 🔔 PUSH (effet secondaire)
  await sendExpoPush({
    userId: input.userId,
    title: input.title,
    body: input.message,
    data: {
      notificationId: notification.id,
      type: input.type,
      ...input.metadata
    }
  });

  // PUSH async + retry
  const data: PushSendJobData = { notificationId: notification.id };

  await pushQueue.add("push:send", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false
  });

  // plus tard: push / email
  // await dispatchPush(notification);
  // await dispatchEmail(notification);

  return notification;
}
