import { Request, Response } from "express";
import { adminGetSellersFinancesUsecase } from "../../../../core/usecases/admin/finances/adminGetSellersFinancesUsecase";
import { adminCreatePayoutUsecase } from "../../../../core/usecases/admin/finances/adminCreatePayoutUsecase";

export const listSellersFinances = async (req: Request, res: Response) => {
    try {
        const finances = await adminGetSellersFinancesUsecase();
        res.json(finances);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPayout = async (req: Request, res: Response) => {
    try {
        const payout = await adminCreatePayoutUsecase(req.body);
        res.status(201).json(payout);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
