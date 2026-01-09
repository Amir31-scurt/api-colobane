"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotificationsController = listNotificationsController;
exports.markNotificationReadController = markNotificationReadController;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listNotificationsController(req, res) {
    const userId = req.auth?.userId || req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "UNAUTHORIZED" });
    const notifications = await prismaClient_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50
    });
    return res.json(notifications);
}
async function markNotificationReadController(req, res) {
    const userId = req.auth?.userId || req.user?.id;
    if (!userId)
        return res.status(401).json({ error: "UNAUTHORIZED" });
    const id = Number(req.params.notificationId);
    const notif = await prismaClient_1.prisma.notification.findFirst({
        where: { id, userId }
    });
    if (!notif) {
        return res.status(404).json({ message: "Notification introuvable" });
    }
    await prismaClient_1.prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
    return res.json({ message: "Notification marquée comme lue" });
}
