"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentUsecase = createPaymentUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createPaymentUsecase(input) {
    const order = await prismaClient_1.prisma.order.findUnique({
        where: { id: input.orderId }
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    const payment = await prismaClient_1.prisma.payment.create({
        data: {
            orderId: order.id,
            provider: input.provider,
            status: "PENDING",
            amount: order.totalAmount
        }
    });
    return payment;
}
