"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrangeMoneyPayment = createOrangeMoneyPayment;
const axios_1 = __importDefault(require("axios"));
async function createOrangeMoneyPayment(amount, paymentId, orderId) {
    const merchantKey = process.env.OM_MERCHANT_KEY;
    const apiKey = process.env.OM_API_KEY;
    const base = process.env.OM_API_BASE;
    const payload = {
        merchant_key: merchantKey,
        currency: "XOF",
        order_id: String(paymentId),
        amount: String(amount),
        return_url: process.env.OM_RETURN_URL || "https://colobane.com/payment/success",
        cancel_url: process.env.OM_CANCEL_URL || "https://colobane.com/payment/cancel",
        notif_url: process.env.OM_WEBHOOK_URL || "https://api.colobane.com/api/payments/orange-money/webhook"
    };
    const response = await axios_1.default.post(base, payload, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`
        }
    });
    return response.data;
}
