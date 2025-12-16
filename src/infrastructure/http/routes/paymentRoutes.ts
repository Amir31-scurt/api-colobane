import express from "express";
import { authRequired, isAdmin, isSeller } from "../middlewares/authMiddleware.ts";
import {
  createPaymentIntentController,
  waveWebhookController,
  orangeMoneyWebhookController,
  confirmCashPaymentController
} from "../controllers/paymentController.ts";

const router = express.Router();

// Intention de paiement (Wave / OM / Cash)
router.post("/intent", authRequired, createPaymentIntentController);

// Webhooks (appelés par Wave/OM) → généralement NON authentifiés
router.post("/wave/webhook", waveWebhookController);
router.post("/orange-money/webhook", orangeMoneyWebhookController);

// Confirmation cash (admin ou seller)
router.post(
  "/cash/confirm/:orderId",
  authRequired,
  isSeller,
  confirmCashPaymentController
);

export default router;
