import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { calculateDeliveryFeeUsecase } from "./calculateDeliveryFeeUsecase";

interface ApplyDeliveryInput {
  orderId: number;
  deliveryZoneId: number;
  deliveryMethodId: number;
  shippingAddress: string;
}

export async function applyDeliveryToOrderUsecase(input: ApplyDeliveryInput) {
  const { orderId, deliveryZoneId, deliveryMethodId, shippingAddress } = input;

  // 1. Fetch Order Items
  const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true } 
  });

  if (!order) throw new Error("ORDER_NOT_FOUND");

  // 2. Calculate Fee
  // We assume 'deliveryZoneId' passed here is actually the ReferenceLocation ID
  // because calculation requires exact location for distance, and frontend passes locationId.
  const { fee } = await calculateDeliveryFeeUsecase({
    items: order.items.map(i => ({ productId: i.productId })),
    deliveryMethodId,
    deliveryLocationId: deliveryZoneId
  });

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryLocationId: deliveryZoneId, // Set the location
      deliveryMethodId,
      shippingAddress,
      deliveryFee: fee
    },
    include: {
      deliveryLocation: true, // Include location instead of zone if we switched
      deliveryMethod: true
    }
  });

  return updated;
}
