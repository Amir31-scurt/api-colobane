// src/core/services/paymentUrlService.ts

export function buildWaveCheckoutUrl(paymentId: number, amount: number): string {
    const base = process.env.WAVE_CHECKOUT_BASE_URL || "https://pay.wave.com/checkout";
    return `${base}?amount=${amount}&ref=${paymentId}`;
  }
  
  export function buildOrangeMoneyCheckoutUrl(paymentId: number, amount: number): string {
    const base = process.env.OM_CHECKOUT_BASE_URL || "https://om.orange.sn/checkout";
    return `${base}?amount=${amount}&ref=${paymentId}`;
  }
  