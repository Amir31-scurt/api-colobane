"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntentController = createPaymentIntentController;
exports.waveWebhookController = waveWebhookController;
exports.orangeMoneyWebhookController = orangeMoneyWebhookController;
exports.confirmCashPaymentController = confirmCashPaymentController;
const createPaymentIntentUsecase_1 = require("../../../core/usecases/payments/createPaymentIntentUsecase");
const confirmCashPaymentUsecase_1 = require("../../../core/usecases/payments/confirmCashPaymentUsecase");
const waveSignatureService_1 = require("../../../core/services/providers/waveSignatureService");
const orangeMoneySignature_1 = require("../../../core/services/providers/orangeMoneySignature");
const queues_1 = require("../../jobs/queues");
async function createPaymentIntentController(req, res) {
    try {
        const { orderId, provider } = req.body;
        const result = await (0, createPaymentIntentUsecase_1.createPaymentIntentUsecase)({
            userId: req.user.id,
            orderId,
            provider
        });
        return res.status(201).json(result);
    }
    catch (err) {
        console.error(err);
        if (err.message === "ORDER_NOT_FOUND_OR_FORBIDDEN") {
            return res.status(404).json({ message: "Commande introuvable ou non autorisée" });
        }
        if (err.message === "ORDER_NOT_PENDING") {
            return res.status(400).json({ message: "La commande n'est plus en statut PENDING" });
        }
        return res.status(500).json({ message: "Erreur interne création paiement" });
    }
}
async function waveWebhookController(req, res) {
    try {
        const rawBody = req.rawBody;
        const signature = req.headers["wave-signature"];
        if (!(0, waveSignatureService_1.verifyWaveSignature)(rawBody, signature)) {
            return res.status(400).json({ message: "Invalid signature" });
        }
        if (queues_1.paymentsQueue) {
            await queues_1.paymentsQueue.add("payments:waveWebhook", { rawBody }, {
                attempts: 10,
                backoff: { type: "exponential", delay: 3000 },
                removeOnComplete: true,
                removeOnFail: false
            });
        }
        return res.json({ ok: true });
    }
    catch (err) {
        console.error("WAVE_WEBHOOK_ENQUEUE_ERROR:", err);
        return res.status(500).json({ message: "Webhook enqueue error" });
    }
}
async function orangeMoneyWebhookController(req, res) {
    try {
        const rawBody = req.rawBody;
        const signature = req.headers["x-api-signature"];
        if (!(0, orangeMoneySignature_1.verifyOrangeMoneySignature)(rawBody, signature)) {
            return res.status(400).json({ message: "Invalid signature" });
        }
        if (queues_1.paymentsQueue) {
            await queues_1.paymentsQueue.add("payments:orangeWebhook", { rawBody }, {
                attempts: 10,
                backoff: { type: "exponential", delay: 3000 },
                removeOnComplete: true,
                removeOnFail: false
            });
        }
        return res.json({ ok: true });
    }
    catch (err) {
        console.error("OM_WEBHOOK_ENQUEUE_ERROR:", err);
        return res.status(500).json({ message: "Webhook enqueue error" });
    }
}
async function confirmCashPaymentController(req, res) {
    try {
        const orderId = Number(req.params.orderId);
        await (0, confirmCashPaymentUsecase_1.confirmCashPaymentUsecase)(orderId);
        return res.json({ message: "Paiement cash confirmé et commande marquée comme payée" });
    }
    catch (err) {
        console.error(err);
        if (err.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Commande introuvable" });
        }
        if (err.message === "CASH_PAYMENT_NOT_FOUND") {
            return res.status(400).json({ message: "Aucun paiement cash en attente pour cette commande" });
        }
        return res.status(500).json({ message: "Erreur interne lors de la confirmation cash" });
    }
}
