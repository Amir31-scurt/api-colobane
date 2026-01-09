"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatusUsecase = updateDeliveryStatusUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const updateOrderStatusUsecase_1 = require("../orders/updateOrderStatusUsecase");
const notificationService_1 = require("../../services/notificationService");
const notificationFactory_1 = require("../../factories/notificationFactory");
const notificationTypes_1 = require("../../constants/notificationTypes");
async function updateDeliveryStatusUsecase(input) {
    const { assignmentId, status, changedByUserId } = input;
    const assignment = await prismaClient_1.prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId },
        include: { order: true }
    });
    if (!assignment)
        throw new Error("ASSIGNMENT_NOT_FOUND");
    const updatedAssignment = await prismaClient_1.prisma.$transaction(async (tx) => {
        const data = { status };
        if (status === "PICKED_UP") {
            data.pickedAt = new Date();
        }
        if (status === "DELIVERED") {
            data.deliveredAt = new Date();
        }
        const updated = await tx.deliveryAssignment.update({
            where: { id: assignmentId },
            data
        });
        // synchroniser statut commande
        let newOrderStatus = null;
        if (status === "PICKED_UP") {
            newOrderStatus = "SHIPPED";
        }
        if (status === "IN_TRANSIT") {
            const content = (0, notificationFactory_1.buildNotificationContent)({
                type: notificationTypes_1.NotificationType.DELIVERY_IN_TRANSIT,
                orderId: assignment.orderId, status
            });
            await (0, notificationService_1.sendNotification)({
                userId: assignment.order.userId,
                type: notificationTypes_1.NotificationType.DELIVERY_IN_TRANSIT,
                title: content.title,
                message: content.message,
                metadata: { orderId: assignment.orderId, status }
            });
            newOrderStatus = "SHIPPED";
        }
        if (status === "DELIVERED") {
            const content = (0, notificationFactory_1.buildNotificationContent)({
                type: notificationTypes_1.NotificationType.ORDER_DELIVERED,
                orderId: assignment.orderId, status
            });
            await (0, notificationService_1.sendNotification)({
                userId: assignment.order.userId,
                type: notificationTypes_1.NotificationType.ORDER_DELIVERED,
                title: content.title,
                message: content.message,
                metadata: { orderId: assignment.orderId, status }
            });
            newOrderStatus = "DELIVERED";
        }
        if (newOrderStatus) {
            await (0, updateOrderStatusUsecase_1.updateOrderStatusUsecase)({
                orderId: assignment.orderId,
                status: newOrderStatus,
                changedByUserId,
                note: `MàJ via livraison: ${status}`
            });
        }
        return updated;
    });
    return updatedAssignment;
}
