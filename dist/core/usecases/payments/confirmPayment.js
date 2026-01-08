"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPaymentUsecase = confirmPaymentUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const notificationService_1 = require("../../services/notificationService");
async function confirmPaymentUsecase(input) {
    const payment = await prismaClient_1.prisma.payment.findUnique({
        where: { id: input.paymentId },
        include: { order: true }
    });
    if (!payment) {
        throw new Error("PAYMENT_NOT_FOUND");
    }
    const newStatus = input.success ? "PAID" : "FAILED";
    const updatedPayment = await prismaClient_1.prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: newStatus,
            providerRef: input.providerRef
        }
    });
    // Si le paiement est OK → on met la commande en PAID
    if (newStatus === "PAID") {
        await prismaClient_1.prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" }
        });
        // On peut aussi créer une notification
        // On peut aussi créer une notification
        await (0, notificationService_1.sendNotification)({
            userId: payment.order.userId,
            type: "ORDER_PAID",
            title: "Paiement confirmé",
            message: `Votre commande #${payment.orderId} a été payée avec succès.`,
            metadata: {
                orderId: payment.orderId,
                paymentId: payment.id
            }
        });
    }
    return updatedPayment;
}
