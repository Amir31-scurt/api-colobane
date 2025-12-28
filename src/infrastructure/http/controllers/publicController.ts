import type { Request, Response } from "express";
import { getPublicStats } from "../../../core/usecases/public/getPublicStats";

export async function getPublicStatsController(req: Request, res: Response) {
    try {
        const stats = await getPublicStats();
        return res.json(stats);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ message: "Erreur récupération statistiques publiques" });
    }
}
