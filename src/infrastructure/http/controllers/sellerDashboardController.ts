import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.ts";
import { getSellerDashboardUsecase } from "../../../core/usecases/seller/getSellerDashboardUsecase.ts";

export async function getSellerDashboardController(req: AuthRequest, res: Response) {
  try {
    const ownerId = req.user!.id;
    const stats = await getSellerDashboardUsecase(ownerId);
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur interne dashboard seller" });
  }
}
