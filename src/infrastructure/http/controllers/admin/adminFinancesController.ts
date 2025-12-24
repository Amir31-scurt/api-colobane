import { Request, Response } from "express";
import { adminGetSellersFinancesUsecase } from "../../../../core/usecases/admin/finances/adminGetSellersFinancesUsecase";
import { adminCreatePayoutUsecase } from "../../../../core/usecases/admin/finances/adminCreatePayoutUsecase";
import { exportFinancesCsvUsecase, ExportFinancesType } from "../../../../core/usecases/admin/finances/exportFinancesCsvUsecase";

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

export const exportFinancesCsv = async (req: Request, res: Response) => {
    try {
        const type = req.query.type as ExportFinancesType;
        const csv = await exportFinancesCsvUsecase(type);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=export_${type}.csv`);
        res.send(csv);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
