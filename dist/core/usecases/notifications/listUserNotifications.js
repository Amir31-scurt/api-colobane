"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserNotificationsUsecase = listUserNotificationsUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listUserNotificationsUsecase(userId) {
    return prismaClient_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
}
