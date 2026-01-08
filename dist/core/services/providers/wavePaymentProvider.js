"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWavePayment = createWavePayment;
const axios_1 = __importDefault(require("axios"));
async function createWavePayment(amount, currency, paymentId, orderId) {
    const apiKey = process.env.WAVE_API_KEY;
    const base = process.env.WAVE_API_BASE;
    const payload = {
        amount,
        currency,
        redirect_url: process.env.WAVE_REDIRECT_URL || "https://colobane.com/payment/success",
        metadata: {
            paymentId,
            orderId
        }
    };
    const response = await axios_1.default.post(base, payload, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        }
    });
    return response.data;
}
