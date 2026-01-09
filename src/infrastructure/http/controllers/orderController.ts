import type { Request, Response } from "express";
import { createOrderUsecase } from "../../../core/usecases/orders/createOrderUsecase";
import { listUserOrdersUsecase } from "../../../core/usecases/orders/listUserOrdersUsecase";
import { listSellerOrdersUsecase } from "../../../core/usecases/orders/listSellerOrdersUsecase";
import { updateOrderStatusUsecase } from "../../../core/usecases/orders/updateOrderStatusUsecase";
import { AuthRequest } from "../middlewares/authMiddleware";
import { getOrderTrackingUsecase } from "../../../core/usecases/orders/getOrderTrackingUsecase";

export async function createOrderController(req: AuthRequest, res: Response) {
  try {
    const order = await createOrderUsecase({
      userId: req.user!.id,
      items: req.body.items,
      deliveryMethodId: req.body.deliveryMethodId,
      deliveryLocationId: req.body.deliveryLocationId,
      shippingAddress: req.body.shippingAddress,
      paymentProvider: req.body.paymentProvider
    });

    return res.status(201).json(order);
  } catch (err: any) {
    console.error(err);
    
    if (err.message.startsWith("INSUFFICIENT_STOCK")) {
      return res.status(400).json({ message: "Stock insuffisant" });
    }

    return res.status(500).json({ message: "Erreur interne" });
  }
}

export async function listUserOrdersController(req: AuthRequest, res: Response) {
  const orders = await listUserOrdersUsecase(req.user!.id);
  return res.json(orders);
}

export async function listSellerOrdersController(req: AuthRequest, res: Response) {
  const orders = await listSellerOrdersUsecase(req.user!.id);
  return res.json(orders);
}

export async function updateOrderStatusController(req: AuthRequest, res: Response) {
  try {
    const orderId = Number(req.params.orderId);
    const { status, note } = req.body;

    const updated = await updateOrderStatusUsecase({
      orderId,
      status,
      changedByUserId: req.user!.id,
      note
    });

    return res.json(updated);
  } catch (err: any) {
    if (err.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}

export async function getOrderTrackingController(req: AuthRequest, res: Response) {
  try {
    const orderId = Number(req.params.orderId);
    const isSeller = req.user!.role === "SELLER" || req.user!.role === "ADMIN";
    const isAdmin = req.user!.role === "ADMIN";

    const order = await getOrderTrackingUsecase(
      orderId,
      req.user!.id,
      isSeller,
      isAdmin
    );

    return res.json(order);
  } catch (err: any) {
    if (err.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Accès non autorisé à cette commande" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}