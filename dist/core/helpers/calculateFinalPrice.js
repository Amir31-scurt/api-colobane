"use strict";
// src/core/helpers/calculateFinalPrice.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFinalPrice = calculateFinalPrice;
function calculateFinalPrice(price, promotions) {
    if (!promotions || promotions.length === 0) {
        return price;
    }
    const now = new Date();
    let bestPrice = price;
    for (const promo of promotions) {
        if (!promo.isActive)
            continue;
        if (now < new Date(promo.startsAt) || now > new Date(promo.endsAt))
            continue;
        let discounted = price;
        if (promo.discountType === "PERCENT") {
            discounted = price * (1 - promo.discountValue / 100);
        }
        else if (promo.discountType === "AMOUNT") {
            discounted = price - promo.discountValue;
            if (discounted < 0)
                discounted = 0;
        }
        if (discounted < bestPrice) {
            bestPrice = discounted;
        }
    }
    return bestPrice;
}
