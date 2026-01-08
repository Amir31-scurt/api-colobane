"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
// Intention de paiement (Wave / OM / Cash)
router.post("/intent", authMiddleware_1.authRequired, paymentController_1.createPaymentIntentController);
// Webhooks (appelés par Wave/OM) → généralement NON authentifiés
router.post("/wave/webhook", paymentController_1.waveWebhookController);
router.post("/orange-money/webhook", paymentController_1.orangeMoneyWebhookController);
// Confirmation cash (admin ou seller)
router.post("/cash/confirm/:orderId", authMiddleware_1.authRequired, authMiddleware_1.isSeller, paymentController_1.confirmCashPaymentController);
exports.default = router;
