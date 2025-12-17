import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface CalculateDeliveryFeeInput {
  orderId: number;
  deliveryZoneId: number;
  deliveryMethodId: number;
}

export async function calculateDeliveryFeeUsecase(input: CalculateDeliveryFeeInput) {
  const { orderId, deliveryZoneId, deliveryMethodId } = input;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
  if (!zone || !zone.isActive) throw new Error("ZONE_NOT_AVAILABLE");

  const method = await prisma.deliveryMethod.findUnique({ where: { id: deliveryMethodId } });
  if (!method || !method.isActive) throw new Error("METHOD_NOT_AVAILABLE");

  const subtotal = order.totalAmount;

  let fee = zone.baseFee;

  if (zone.minAmountFree && subtotal >= zone.minAmountFree) {
    fee = 0;
  }

  // perKmFee à intégrer plus tard si tu ajoutes distance
  // ex: fee += (distanceKm * (zone.perKmFee ?? 0));

  return {
    deliveryFee: fee,
    zone,
    method
  };
}
