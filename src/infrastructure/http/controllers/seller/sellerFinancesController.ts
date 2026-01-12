import { Request, Response } from "express";
import { sellerGetFinancesUsecase } from "../../../../core/usecases/seller/finances/sellerGetFinancesUsecase";
import { requestPayoutUsecase } from "../../../../core/usecases/seller/finances/requestPayoutUsecase";

export const getSellerFinances = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).auth.userId;
        const finances = await sellerGetFinancesUsecase(sellerId);
        res.json(finances);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const requestPayout = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).auth.userId;
        const { amount, provider, note, phone } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Montant requis" });
        }

        const payout = await requestPayoutUsecase({
            sellerId,
            amount: Number(amount),
            provider,
            note,
            phone
        });

        res.status(201).json({ 
            message: "Demande de retrait envoyée avec succès",
            payout 
        });
    } catch (error: any) {
        console.error("Payout request error:", error);
        res.status(500).json({ message: error.message || "Erreur interne" });
    }
};
