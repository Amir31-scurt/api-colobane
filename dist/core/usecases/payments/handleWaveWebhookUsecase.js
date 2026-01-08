"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWaveWebhookUsecase = handleWaveWebhookUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const notificationTypes_1 = require("../../constants/notificationTypes");
const notificationFactory_1 = require("../../factories/notificationFactory");
const notificationService_1 = require("../../services/notificationService");
const calculateFeesForOrderUsecase_1 = require("../fees/calculateFeesForOrderUsecase");
const saveOrderFeesUsecase_1 = require("../fees/saveOrderFeesUsecase");
async function handleWaveWebhookUsecase(payload) {
    const payment = await prismaClient_1.prisma.payment.findFirst({
        where: {
            providerRef: payload.providerRef,
            provider: "WAVE"
        },
        include: { order: true }
    });
    if (!payment) {
        throw new Error("PAYMENT_NOT_FOUND");
    }
    if (payload.status === "SUCCESS") {
        const order = await prismaClient_1.prisma.order.findUnique({
            where: { id: payment.orderId }
        });
        if (!order) {
            throw new Error("ORDER_NOT_FOUND");
        }
        await prismaClient_1.prisma.$transaction([
            prismaClient_1.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: "PAID",
                    amount: payload.amount
                }
            }),
            prismaClient_1.prisma.order.update({
                where: { id: payment.orderId },
                data: {
                    status: "PAID",
                    paidAt: new Date()
                }
            })
        ]);
        const content = (0, notificationFactory_1.buildNotificationContent)({
            type: notificationTypes_1.NotificationType.ORDER_PAID,
            orderId: payment.orderId,
            status
        });
        await (0, notificationService_1.sendNotification)({
            userId: order.userId,
            type: notificationTypes_1.NotificationType.ORDER_PAID,
            title: content.title,
            message: content.message,
            metadata: { orderId: payment.orderId, status }
        });
        const fees = await (0, calculateFeesForOrderUsecase_1.calculateFeesForOrderUsecase)(payment.orderId, "WAVE");
        await (0, saveOrderFeesUsecase_1.saveOrderFeesUsecase)(payment.orderId, fees);
    }
    else {
        await prismaClient_1.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "FAILED"
            }
        });
    }
    return true;
}
