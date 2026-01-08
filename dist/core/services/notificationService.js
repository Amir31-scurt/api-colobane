"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
exports.broadcastToAdmins = broadcastToAdmins;
const prismaClient_1 = require("../../infrastructure/prisma/prismaClient");
const expoPushService_1 = require("./push/expoPushService");
const resendProvider_1 = require("../../infrastructure/email/resendProvider");
const notificationTemplates_1 = require("../../infrastructure/email/templates/notificationTemplates");
async function sendNotification(input) {
    const notification = await prismaClient_1.prisma.notification.create({
        data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
        }
    });
    // 📧 EMAIL
    try {
        const user = await prismaClient_1.prisma.user.findUnique({ where: { id: input.userId } });
        if (user && user.email) {
            const template = (0, notificationTemplates_1.getEmailTemplate)(input.type, input.metadata || {});
            if (template) {
                await (0, resendProvider_1.sendEmail)({
                    to: user.email,
                    subject: template.subject,
                    html: template.html
                });
            }
        }
    }
    catch (err) {
        console.error("Email notification error:", err);
    }
    // 🔔 PUSH (effet secondaire)
    await (0, expoPushService_1.sendExpoPush)({
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
    const data = { notificationId: notification.id };
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
async function broadcastToAdmins(type, title, message, metadata) {
    const admins = await prismaClient_1.prisma.user.findMany({ where: { role: "ADMIN" } });
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
