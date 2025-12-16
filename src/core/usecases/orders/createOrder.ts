import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";
import { calculateFinalPrice } from "../../helpers/calculateFinalPrice.ts";

interface OrderItemInput {
  productId: number;
  quantity: number;
}

interface CreateOrderInput {
  userId: number;
  items: OrderItemInput[];
}

export async function createOrderUsecase(input: CreateOrderInput) {
  const { userId, items } = input;

  if (!items || items.length === 0) {
    throw new Error("EMPTY_ORDER");
  }

  const productIds = items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      brand: { include: { promotions: true } },
      promotions: true,
      categories: { include: { promotions: true } }
    }
  });

  if (products.length !== productIds.length) {
    throw new Error("INVALID_PRODUCT");
  }

  let total = 0;

  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;

    const promotions = [
      ...(product.promotions ?? []),
      ...(product.brand?.promotions ?? []),
      ...(product.categories ?? []).flatMap((c) => c.promotions ?? [])
    ].map((p) => ({
      discountType: p.discountType as "PERCENT" | "AMOUNT",
      discountValue: p.discountValue,
      isActive: p.isActive,
      startsAt: p.startsAt,
      endsAt: p.endsAt
    }));

    const finalUnitPrice = calculateFinalPrice(product.price, promotions);
    const lineTotal = finalUnitPrice * item.quantity;
    total += lineTotal;

    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: finalUnitPrice
    };
  });

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount: total,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: true
    }
  });

  return order;
}
