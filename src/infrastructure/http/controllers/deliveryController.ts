import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { applyDeliveryToOrderUsecase } from "../../../core/usecases/delivery/applyDeliveryToOrderUsecase";
import { assignDelivererUsecase } from "../../../core/usecases/delivery/assignDelivererUsecase";
import { updateDeliveryStatusUsecase } from "../../../core/usecases/delivery/updateDeliveryStatusUsecase";
import { listDeliveryZones } from "../../../core/usecases/delivery/listDeliveryZones";

export async function listDeliveryZonesController(req: Request, res: Response) {
  try {
    const zones = await listDeliveryZones();
    return res.json(zones);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Erreur récupération zones de livraison" });
  }
}

export async function applyDeliveryController(req: AuthRequest, res: Response) {
  try {
    const { orderId, deliveryZoneId, deliveryMethodId, shippingAddress } = req.body;

    const updated = await applyDeliveryToOrderUsecase({
      orderId,
      deliveryZoneId,
      deliveryMethodId,
      shippingAddress
    });

    return res.json(updated);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Erreur application livraison" });
  }
}

export async function assignDelivererController(req: AuthRequest, res: Response) {
  try {
    const { orderId, delivererId, methodId } = req.body;

    const assignment = await assignDelivererUsecase({
      orderId,
      delivererId,
      methodId
    });

    return res.json(assignment);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Erreur assignation livreur" });
  }
}

export async function updateDeliveryStatusController(req: AuthRequest, res: Response) {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const { status } = req.body;

    const updated = await updateDeliveryStatusUsecase({
      assignmentId,
      status,
      changedByUserId: req.user!.id
    });

    return res.json(updated);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Erreur maj statut livraison" });
  }
}

export async function calculateFeeController(req: Request, res: Response) {
  try {
    const { items, deliveryMethodId, deliveryLocationId } = req.body;
    
    // items must be { productId: number }[]
    const result = await import("../../../core/usecases/delivery/calculateDeliveryFeeUsecase").then(m => 
      m.calculateDeliveryFeeUsecase({
        items,
        deliveryMethodId,
        deliveryLocationId
      })
    );

    return res.json(result);
  } catch (err: any) {
    if (err.message === "INVALID_DELIVERY_LOCATION") {
      return res.status(400).json({ error: "INVALID_DELIVERY_LOCATION" });
    }
    console.error(err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
