"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDelivererUsecase = assignDelivererUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const notificationTypes_1 = require("../../constants/notificationTypes");
const notificationFactory_1 = require("../../factories/notificationFactory");
const notificationService_1 = require("../../services/notificationService");
async function assignDelivererUsecase(input) {
    const { orderId, delivererId, methodId } = input;
    const order = await prismaClient_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    const deliverer = await prismaClient_1.prisma.deliverer.findUnique({ where: { id: delivererId } });
    if (!deliverer || !deliverer.isActive)
        throw new Error("DELIVERER_NOT_AVAILABLE");
    const assignment = await prismaClient_1.prisma.deliveryAssignment.create({
        data: {
            orderId,
            delivererId,
            methodId: methodId ?? order.deliveryMethodId
        },
        include: {
            deliverer: { include: { user: true } },
            order: true
        }
    });
    const content = (0, notificationFactory_1.buildNotificationContent)({
        type: notificationTypes_1.NotificationType.DELIVERY_ASSIGNED,
        orderId,
    });
    await (0, notificationService_1.sendNotification)({
        userId: assignment.deliverer.userId,
        type: notificationTypes_1.NotificationType.DELIVERY_ASSIGNED,
        title: content.title,
        message: content.message,
        metadata: { orderId: orderId }
    });
    return assignment;
}
