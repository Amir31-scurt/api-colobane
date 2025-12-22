import { Request, Response } from "express";
import { adminGetOrderUsecase } from "../../../../core/usecases/admin/orders/adminGetOrderUsecase";
import { adminUpdateOrderStatusUsecase } from "../../../../core/usecases/admin/orders/adminUpdateOrderStatusUsecase";
import { adminListOrdersUsecase } from "../../../../core/usecases/admin/orders/adminListOrdersUsecase";

export async function adminListOrdersController(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 20)));
    const status = req.query.status ? String(req.query.status) : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;

    const data = await adminListOrdersUsecase({ page, pageSize, status, q });
    return res.json(data);
  } catch {
    return res.status(400).json({ error: "UNKNOWN" });
  }
}

export async function adminGetOrderController(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    if (!Number.isFinite(orderId)) return res.status(400).json({ error: "INVALID_ID" });

    const data = await adminGetOrderUsecase(orderId);
    return res.json(data);
  } catch (e: any) {
    return res.status(e?.message === "ORDER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
  }
}

export async function adminUpdateOrderStatusController(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body || {};
    if (!Number.isFinite(orderId) || !status) return res.status(400).json({ error: "INVALID_BODY" });

    const updated = await adminUpdateOrderStatusUsecase({
      actorId: req.auth!.userId,
      orderId,
      status
    });

    return res.json(updated);
  } catch (e: any) {
    return res.status(e?.message === "ORDER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
  }
}
