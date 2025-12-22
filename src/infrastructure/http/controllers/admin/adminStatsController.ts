import { Request, Response } from "express";
import { adminGetStatsUsecase } from "../../../../core/usecases/admin/stats/adminGetStatsUsecase";

export async function adminStatsController(_: Request, res: Response) {
  try {
    const data = await adminGetStatsUsecase();
    return res.json(data);
  } catch {
    return res.status(400).json({ error: "UNKNOWN" });
  }
}
