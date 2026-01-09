"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationUsecase = createNotificationUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createNotificationUsecase(input) {
    return prismaClient_1.prisma.notification.create({
        data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            metadata: input.data ?? null
        }
    });
}
