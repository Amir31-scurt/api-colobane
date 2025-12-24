import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { PayoutStatus } from "@prisma/client";

interface CreatePayoutInput {
    sellerId: number;
    amount: number;
    provider?: string;
    reference?: string;
    note?: string;
    status: PayoutStatus;
}

export async function adminCreatePayoutUsecase(input: CreatePayoutInput) {
    // Optional: check if seller has enough balance? 
    // For now, allow admin to record whatever they want.

    return prisma.payout.create({
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
