// src/infrastructure/http/routes/deliveryRoutes.ts
import express from "express";
import { authRequired, isSeller, isAdmin } from "../middlewares/authMiddleware";
import {
  applyDeliveryController,
  assignDelivererController,
  updateDeliveryStatusController,
  listDeliveryZonesController,
  calculateFeeController
} from "../controllers/deliveryController";

const router = express.Router();

// Public: List zones
router.get("/zones", listDeliveryZonesController);

// Public (or auth optional): Calculate fee
router.post("/calculate", calculateFeeController);

// User choisit zone + méthode + adresse
router.post("/apply", authRequired, applyDeliveryController);

// Seller/Admin assigne un livreur
router.post("/assign", authRequired, isSeller, assignDelivererController);

// Livreurs/sellers mettent à jour le statut
router.put(
  "/assignment/:assignmentId/status",
  authRequired,
  updateDeliveryStatusController
);

export default router;
