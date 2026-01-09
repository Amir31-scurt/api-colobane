"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/deliveryRoutes.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const deliveryController_1 = require("../controllers/deliveryController");
const router = express_1.default.Router();
// Public: List zones
router.get("/zones", deliveryController_1.listDeliveryZonesController);
// Public (or auth optional): Calculate fee
router.post("/calculate", deliveryController_1.calculateFeeController);
// User choisit zone + méthode + adresse
router.post("/apply", authMiddleware_1.authRequired, deliveryController_1.applyDeliveryController);
// Seller/Admin assigne un livreur
router.post("/assign", authMiddleware_1.authRequired, authMiddleware_1.isSeller, deliveryController_1.assignDelivererController);
// Livreurs/sellers mettent à jour le statut
router.put("/assignment/:assignmentId/status", authMiddleware_1.authRequired, deliveryController_1.updateDeliveryStatusController);
exports.default = router;
