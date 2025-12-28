import type { Request, Response } from "express";
import { listActivePromotions } from "../../../../core/usecases/promotions/listActivePromotions";

export async function listActivePromotionsController(req: Request, res: Response) {
    try {
        const promotions = await listActivePromotions();
        return res.json(promotions);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ message: "Erreur récupération promotions" });
    }
}
