import { Request, Response } from "express";
import { adminGetStatsUsecase } from "../../../../core/usecases/admin/stats/adminGetStatsUsecase";
import { adminGetTimeSeriesStatsUsecase } from "../../../../core/usecases/admin/stats/adminGetTimeSeriesStatsUsecase";
import { adminGetKPIsUsecase } from "../../../../core/usecases/admin/stats/adminGetKPIsUsecase";

export async function adminStatsController(_: Request, res: Response) {
  try {
    const data = await adminGetStatsUsecase();
    return res.json(data);
  } catch {
    return res.status(400).json({ error: "UNKNOWN" });
  }
}

export async function adminGetTimeSeriesStatsController(_: Request, res: Response) {
  try {
    const data = await adminGetTimeSeriesStatsUsecase();
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "UNKNOWN" });
  }
}

export async function adminGetKPIsController(_: Request, res: Response) {
  try {
    const data = await adminGetKPIsUsecase();
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "UNKNOWN" });
  }
}
