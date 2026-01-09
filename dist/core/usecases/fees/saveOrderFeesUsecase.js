"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveOrderFeesUsecase = saveOrderFeesUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function saveOrderFeesUsecase(orderId, fees) {
    return prismaClient_1.prisma.feeRecord.createMany({
        data: fees.map(f => ({
            orderId,
            feeId: f.feeId ?? null,
            name: f.name,
            type: f.type,
            target: f.target,
            value: f.value,
            appliedAmount: f.appliedAmount,
            sellerId: f.sellerId ?? null
        }))
    });
}
