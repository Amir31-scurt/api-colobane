import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { broadcastToAdmins } from "../../../services/notificationService";

interface RequestPayoutInput {
    sellerId: number;
    amount: number;
    provider?: string;
    note?: string;
    phone?: string; // e.g. for Wave/OM
}

export async function requestPayoutUsecase(input: RequestPayoutInput) {
    // 1. Basic validation (in a real app, check wallet balance here)
    if (input.amount <= 0) {
        throw new Error("Ivalid amount");
    }

    // 2. Create the Payout Request
    const payout = await prisma.payout.create({
        data: {
            sellerId: input.sellerId,
            amount: input.amount,
            provider: input.provider || "MANUAL",
            status: "PENDING",
            note: input.note,
            reference: `REQ-${Date.now()}-${input.sellerId}` // Temporary ref
        },
        include: {
            seller: { select: { name: true, email: true } }
        }
    });

    // 3. Notify Admins
    try {
        await broadcastToAdmins(
            "PAYOUT_REQUEST",
            "Demande de Retrait",
            `Le vendeur ${payout.seller.name} a demandé un retrait de ${input.amount} FCFA.`,
            { 
                payoutId: payout.id, 
                sellerId: input.sellerId, 
                amount: input.amount,
                provider: input.provider 
            }
        );
    } catch (error) {
        console.error("Failed to notify admins of payout request:", error);
    }

    return payout;
}
