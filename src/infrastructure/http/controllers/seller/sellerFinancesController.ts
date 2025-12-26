import { Request, Response } from "express";
import { sellerGetFinancesUsecase } from "../../../../core/usecases/seller/finances/sellerGetFinancesUsecase";

export const getSellerFinances = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).auth.userId;
        const finances = await sellerGetFinancesUsecase(sellerId);
        res.json(finances);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
