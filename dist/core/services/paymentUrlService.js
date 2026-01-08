"use strict";
// src/core/services/paymentUrlService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWaveCheckoutUrl = buildWaveCheckoutUrl;
exports.buildOrangeMoneyCheckoutUrl = buildOrangeMoneyCheckoutUrl;
function buildWaveCheckoutUrl(paymentId, amount) {
    const base = process.env.WAVE_CHECKOUT_BASE_URL || "https://pay.wave.com/checkout";
    return `${base}?amount=${amount}&ref=${paymentId}`;
}
function buildOrangeMoneyCheckoutUrl(paymentId, amount) {
    const base = process.env.OM_CHECKOUT_BASE_URL || "https://om.orange.sn/checkout";
    return `${base}?amount=${amount}&ref=${paymentId}`;
}
