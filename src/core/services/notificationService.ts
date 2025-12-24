import { PushSendJobData } from "../../infrastructure/jobs/jobTypes";
import { pushQueue } from "../../infrastructure/jobs/queues";
import { prisma } from "../../infrastructure/prisma/prismaClient";
import { sendExpoPush } from "./push/expoPushService";
import { sendEmail } from "../../infrastructure/email/resendProvider";
import { getEmailTemplate } from "../../infrastructure/email/templates/notificationTemplates";

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
    }
  });

  // 📧 EMAIL
  try {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (user && user.email) {
      const template = getEmailTemplate(input.type, input.metadata || {});
      if (template) {
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html
        });
      }
    }
  } catch (err) {
    console.error("Email notification error:", err);
  }

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

  //   if(pushQueue){
  //     await pushQueue.add("push:send", data, {
  //         attempts: 5,
  //         backoff: { type: "exponential", delay: 2000 },
  //         removeOnComplete: true,
  //         removeOnFail: false
  //     });
  //   }

  // plus tard: push / email
  // await dispatchPush(notification);
  // await dispatchEmail(notification);

  return notification;
}

export async function broadcastToAdmins(type: string, title: string, message: string, metadata: any) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  for (const admin of admins) {
    await sendNotification({
      userId: admin.id,
      type,
      title,
      message,
      metadata
    });
  }
}
