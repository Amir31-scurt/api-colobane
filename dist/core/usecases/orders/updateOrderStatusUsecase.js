"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusUsecase = updateOrderStatusUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const client_1 = require("@prisma/client");
const notificationService_1 = require("../../services/notificationService");
const notificationFactory_1 = require("../../factories/notificationFactory");
const notificationTypes_1 = require("../../constants/notificationTypes");
async function updateOrderStatusUsecase(input) {
    const { orderId, nextStatus, changedByUserId, note } = input;
    const order = await prismaClient_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order)
        throw new Error("ORDER_NOT_FOUND");
    const currentStatus = order.status;
    // ❌ États finaux bloqués
    if (currentStatus === client_1.OrderStatus.COMPLETED ||
        currentStatus === client_1.OrderStatus.CANCELLED) {
        throw new Error("ORDER_ALREADY_FINALIZED");
    }
    // 🔒 Matrice officielle des transitions autorisées
    const allowedTransitions = {
        PENDING: [client_1.OrderStatus.PAID, client_1.OrderStatus.CANCELLED],
        PAID: [client_1.OrderStatus.PROCESSING],
        PROCESSING: [client_1.OrderStatus.SHIPPED],
        SHIPPED: [client_1.OrderStatus.DELIVERED],
        DELIVERED: [client_1.OrderStatus.COMPLETED],
        COMPLETED: [],
        CANCELLED: []
    };
    const allowedNextStatuses = allowedTransitions[currentStatus];
    if (!allowedNextStatuses.includes(nextStatus)) {
        throw new Error(`INVALID_ORDER_STATUS_TRANSITION: ${currentStatus} → ${nextStatus}`);
    }
    // 🔐 Règle critique : passage à PAID uniquement si paiement PAID
    if (nextStatus === client_1.OrderStatus.PAID) {
        const newOrder = await prismaClient_1.prisma.order.findUnique({
            where: { id: orderId },
            include: { Payment: true }
        });
        if (!newOrder) {
            throw new Error("NO_ORDER_MATCHES_THE_ID");
        }
        const hasPaidPayment = newOrder.Payment.some((p) => p.status === client_1.PaymentStatus.PAID);
        if (!hasPaidPayment) {
            throw new Error("ORDER_CANNOT_BE_MARKED_PAID_WITHOUT_PAYMENT");
        }
    }
    const actor = await prismaClient_1.prisma.order.findUnique({
        where: { id: order.userId },
        include: { user: true }
    });
    const actorRole = actor?.user.role;
    // 🔐 Seul l’ADMIN peut annuler après paiement
    if (nextStatus === client_1.OrderStatus.CANCELLED &&
        currentStatus !== client_1.OrderStatus.PENDING &&
        actorRole !== "ADMIN") {
        throw new Error("ONLY_ADMIN_CAN_CANCEL_AFTER_PAYMENT");
    }
    const updated = await prismaClient_1.prisma.$transaction(async (tx) => {
        const orderUpdated = await tx.order.update({
            where: { id: orderId },
            data: {
                status: nextStatus,
                paidAt: status === "PAID" && !order.paidAt
                    ? new Date()
                    : order.paidAt
            }
        });
        await tx.orderStatusHistory.create({
            data: {
                orderId: orderId,
                status: nextStatus,
                note: note ?? null,
                changedBy: changedByUserId ?? null
            }
        });
        let type = notificationTypes_1.NotificationType.ORDER_STATUS_CHANGED;
        if (nextStatus === "SHIPPED") {
            type = notificationTypes_1.NotificationType.ORDER_SHIPPED;
        }
        const content = (0, notificationFactory_1.buildNotificationContent)({
            type,
            orderId,
            status: nextStatus,
        });
        await (0, notificationService_1.sendNotification)({
            userId: order.userId,
            type,
            title: content.title,
            message: content.message,
            metadata: { orderId, status: nextStatus }
        });
        return orderUpdated;
    });
    return updated;
}
