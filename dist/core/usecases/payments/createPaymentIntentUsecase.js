"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntentUsecase = createPaymentIntentUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const paymentUrlService_1 = require("../../services/paymentUrlService");
const wavePaymentProvider_1 = require("../../services/providers/wavePaymentProvider");
async function createPaymentIntentUsecase(input) {
    const { userId, orderId, provider } = input;
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
    });
    if (!order || order.userId !== userId) {
        throw new Error("ORDER_NOT_FOUND_OR_FORBIDDEN");
    }
    if (order.status !== "PENDING") {
        throw new Error("ORDER_NOT_PENDING");
    }
    const amount = order.totalAmount;
    const currency = "XOF";
    const payment = await prismaClient_1.prisma.payment.create({
        data: {
            orderId,
            provider,
            amount,
            currency,
            status: provider === "CASH"
                ? "WAITING_CONFIRMATION"
                : "INITIATED"
        }
    });
    let checkoutUrl;
    if (provider === "WAVE") {
        const waveResult = await (0, wavePaymentProvider_1.createWavePayment)(amount, currency, payment.id, orderId);
        checkoutUrl = waveResult.url;
        await prismaClient_1.prisma.payment.update({
            where: { id: payment.id },
            data: {
                providerRef: waveResult.id,
                providerMeta: waveResult
            }
        });
    }
    else if (provider === "ORANGE_MONEY") {
        checkoutUrl = (0, paymentUrlService_1.buildOrangeMoneyCheckoutUrl)(payment.id, amount);
    }
    else if (provider === "CASH") {
        checkoutUrl = undefined;
    }
    if (checkoutUrl) {
        await prismaClient_1.prisma.payment.update({
            where: { id: payment.id },
            data: {
                providerMeta: {
                    checkoutUrl
                }
            }
        });
    }
    return {
        paymentId: payment.id,
        provider,
        amount,
        currency,
        checkoutUrl
    };
}
