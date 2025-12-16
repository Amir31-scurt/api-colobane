import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";
import { calculateDeliveryFeeUsecase } from "./calculateDeliveryFeeUsecase.ts";

interface ApplyDeliveryInput {
  orderId: number;
  deliveryZoneId: number;
  deliveryMethodId: number;
  shippingAddress: string;
}

export async function applyDeliveryToOrderUsecase(input: ApplyDeliveryInput) {
  const { orderId, deliveryZoneId, deliveryMethodId, shippingAddress } = input;

  const { deliveryFee } = await calculateDeliveryFeeUsecase({
    orderId,
    deliveryZoneId,
    deliveryMethodId
  });

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryZoneId,
      deliveryMethodId,
      shippingAddress,
      deliveryFee
      // totalAmount reste le total produits; tu peux aussi stocker totalWithDelivery séparément si tu veux
    },
    include: {
      deliveryZone: true,
      deliveryMethod: true
    }
  });

  return updated;
}
