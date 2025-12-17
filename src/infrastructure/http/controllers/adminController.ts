import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { getAdminOverviewUsecase } from "../../../core/usecases/admin/getAdminOverviewUsecase";
import { getAdminFeesReportUsecase } from "../../../core/usecases/admin/getAdminFeesReportUsecase";
import { getSellersPerformanceUsecase, toggleSellerStatusUsecase } from "../../../core/usecases/admin/getSellersPerformanceUsecase";
import { listAdminOrdersUsecase } from "../../../core/usecases/admin/listAdminOrdersUsecase";
import { exportOrdersCsvUsecase } from "../../../core/usecases/admin/exportOrdersCsvUsecase";
import { getAdminAlertsUsecase } from "../../../core/usecases/admin/getAdminAlertsUsecase";

export async function getAdminOverviewController(req: AuthRequest, res: Response) {
  const data = await getAdminOverviewUsecase();
  return res.json(data);
}

export async function getAdminFeesController(req: AuthRequest, res: Response) {
  const data = await getAdminFeesReportUsecase();
  return res.json(data);
}

export async function getAdminSellersController(req: AuthRequest, res: Response) {
  const data = await getSellersPerformanceUsecase();
  return res.json(data);
}

export async function listAdminOrdersController(req: AuthRequest, res: Response) {
    const {
      status,
      from,
      to,
      paymentProvider,
      phone,
      onlyCashPending
    } = req.query;
  
    const orders = await listAdminOrdersUsecase({
      status: status as any,
      from: from ? new Date(from.toString()) : undefined,
      to: to ? new Date(to.toString()) : undefined,
      paymentProvider: paymentProvider as any,
      phone: phone?.toString(),
      onlyCashPending: onlyCashPending === "true"
    });
  
    return res.json(orders);
}

export async function exportOrdersCsvController(req: AuthRequest, res: Response) {
    const csv = await exportOrdersCsvUsecase();
  
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.send(csv);
}
  
export async function getAdminAlertsController(req: AuthRequest, res: Response) {
    try {
      const alerts = await getAdminAlertsUsecase();
      return res.json(alerts);
    } catch (err) {
      console.error("ADMIN_ALERTS_ERROR:", err);
      return res.status(500).json({
        message: "Erreur lors de la récupération des alertes admin"
      });
    }
}

export async function toggleSellerStatusController(req: AuthRequest, res: Response) {
    try {
      const sellerId = Number(req.params.sellerId);
      const { isActive } = req.body;
  
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "Le champ isActive doit être un boolean"
        });
      }
  
      const updatedSeller = await toggleSellerStatusUsecase(sellerId, isActive);
  
      return res.json({
        message: `Vendeur ${isActive ? "activé" : "désactivé"} avec succès`,
        seller: {
          id: updatedSeller.id,
          name: updatedSeller.name,
          email: updatedSeller.email,
        }
      });
    } catch (err) {
      console.error("TOGGLE_SELLER_STATUS_ERROR:", err);
      return res.status(500).json({
        message: "Erreur lors de la mise à jour du statut du vendeur"
      });
    }
}