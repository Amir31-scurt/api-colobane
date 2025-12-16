// src/infrastructure/http/routes/deliveryRoutes.ts
import express from "express";
import { authRequired, isSeller, isAdmin } from "../middlewares/authMiddleware.ts";
import {
  applyDeliveryController,
  assignDelivererController,
  updateDeliveryStatusController
} from "../controllers/deliveryController.ts";

const router = express.Router();

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
