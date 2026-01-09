"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationReadUsecase = markNotificationReadUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function markNotificationReadUsecase(notificationId, userId) {
    const notif = await prismaClient_1.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notif || notif.userId !== userId) {
        throw new Error("NOTIFICATION_NOT_FOUND");
    }
    return prismaClient_1.prisma.notification.update({
        where: { id: notificationId },
        data: {
            isRead: true,
            readAt: new Date()
        }
    });
}
