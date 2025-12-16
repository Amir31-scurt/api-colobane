import type { Product, Promotion } from "@prisma/client";

/**
 * Calcule le prix final d’un produit en tenant compte
 * des promotions actives (product / brand / category)
 */
export function mapProductWithFinalPrice(product: any) {
  const now = new Date();

  const basePrice = product.price;

  let finalPrice = basePrice;
  let appliedPromotion: Promotion | null = null;

  const promotions: Promotion[] = product.promotions ?? [];

  for (const promo of promotions) {
    if (
      promo.isActive &&
      promo.startsAt <= now &&
      promo.endsAt >= now
    ) {
      if (promo.type === "PERCENT") {
        const discounted = basePrice - basePrice * (promo.value / 100);
        if (discounted < finalPrice) {
          finalPrice = discounted;
          appliedPromotion = promo;
        }
      }

      if (promo.type === "FIXED") {
        const discounted = basePrice - promo.value;
        if (discounted < finalPrice) {
          finalPrice = discounted;
          appliedPromotion = promo;
        }
      }
    }
  }

  return {
    ...product,
    basePrice,
    finalPrice,
    hasPromotion: appliedPromotion !== null,
    appliedPromotion: appliedPromotion
      ? {
          id: appliedPromotion.id,
          type: appliedPromotion.type,
          value: appliedPromotion.value,
        }
      : null,
  };
}
