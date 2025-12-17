import express from "express";
import { authRequired, isSeller, isAdmin } from "../middlewares/authMiddleware";
import {
  createOrderController,
  listUserOrdersController,
  listSellerOrdersController,
  updateOrderStatusController,
  getOrderTrackingController
} from "../controllers/orderController";

const router = express.Router();

// Create order (user)
router.post("/", authRequired, createOrderController);

// User orders
router.get("/mine", authRequired, listUserOrdersController);

// Seller orders
router.get("/seller", authRequired, isSeller, listSellerOrdersController);

// Tracking d'une commande (user, seller, admin)
router.get("/:orderId/tracking", authRequired, getOrderTrackingController);

// Mise à jour statut commande (seller/admin)
router.put("/:orderId/status", authRequired, isSeller, updateOrderStatusController);

export default router;
