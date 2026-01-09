"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCreatePayoutUsecase = adminCreatePayoutUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminCreatePayoutUsecase(input) {
    // Optional: check if seller has enough balance? 
    // For now, allow admin to record whatever they want.
    return prismaClient_1.prisma.payout.create({
        data: {
            sellerId: input.sellerId,
            amount: input.amount,
            provider: input.provider,
            reference: input.reference,
            note: input.note,
            status: input.status
        }
    });
}
