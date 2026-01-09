"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmCashPaymentUsecase = confirmCashPaymentUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const notificationTypes_1 = require("../../constants/notificationTypes");
const notificationFactory_1 = require("../../factories/notificationFactory");
const notificationService_1 = require("../../services/notificationService");
const calculateFeesForOrderUsecase_1 = require("../fees/calculateFeesForOrderUsecase");
const saveOrderFeesUsecase_1 = require("../fees/saveOrderFeesUsecase");
async function confirmCashPaymentUsecase(orderId) {
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { Payment: true }
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    const cashPayment = order.Payment.find((p) => p.provider === "CASH" && p.status === "WAITING_CONFIRMATION");
    if (!cashPayment) {
        throw new Error("CASH_PAYMENT_NOT_FOUND");
    }
    await prismaClient_1.prisma.$transaction([
        prismaClient_1.prisma.payment.update({
            where: { id: cashPayment.id },
            data: { status: "PAID" }
        }),
        prismaClient_1.prisma.order.update({
            where: { id: order.id },
            data: {
                status: "PAID",
                paidAt: new Date()
            }
        })
    ]);
    const content = (0, notificationFactory_1.buildNotificationContent)({
        type: notificationTypes_1.NotificationType.ORDER_PAID,
        orderId,
        status
    });
    await (0, notificationService_1.sendNotification)({
        userId: order.userId,
        type: notificationTypes_1.NotificationType.ORDER_PAID,
        title: content.title,
        message: content.message,
        metadata: { orderId, status }
    });
    const fees = await (0, calculateFeesForOrderUsecase_1.calculateFeesForOrderUsecase)(orderId, "WAVE");
    await (0, saveOrderFeesUsecase_1.saveOrderFeesUsecase)(orderId, fees);
    return true;
}
