import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { NotificationType } from "../../constants/notificationTypes";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { calculateFinalPrice } from "../../helpers/calculateFinalPrice";
import { sendNotification } from "../../services/notificationService";

interface OrderItemInput {
  productId: number;
  variantId?: number;
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
      categories: { include: { promotions: true } },
      variants: true
    }
  });

  if (products.length !== productIds.length) {
    throw new Error("INVALID_PRODUCT");
  }

  let total = 0;
  const orderItemsData = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;

    // Identifier variant si variantId fourni
    let variant = null;
    if (item.variantId) {
      variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) throw new Error("INVALID_VARIANT");
    }

    // Prix catalogue
    const basePrice = variant?.price ?? product.price;

    // Collecte promotions
    const promotions = [
      ...(product.promotions ?? []),
      ...(product.brand?.promotions ?? []),
      ...(product.categories ?? []).flatMap((c) => c.promotions ?? [])
    ].map((promo) => ({
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      isActive: promo.isActive,
      startsAt: promo.startsAt,
      endsAt: promo.endsAt
    }));

    const finalUnitPrice = calculateFinalPrice(basePrice, promotions);

    const lineTotal = finalUnitPrice * item.quantity;
    total += lineTotal;

    // Vérification stock
    if (variant) {
      if (variant.stock < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK_VARIANT_${variant.id}`);
      }
    } else {
      if (product.stock < item.quantity) {
        
          if (product.stock <= 5) {
            const content = buildNotificationContent({
                type: NotificationType.LOW_STOCK,
                orderId: product.id,
                productName: product.name
              });
              
              await sendNotification({
                userId: product.brand.ownerId,
                type: NotificationType.LOW_STOCK,
                title: content.title,
                message: content.message,
                metadata: { productId: product.id, productName: product.name }
              });
        //       await sendNotification({
        //         userId: sellerId,
        //         type: "LOW_STOCK",
        //         title: "Stock faible",
        //         message: `Le produit ${product.name} est presque épuisé.`,
        //         metadata: { productId: product.id }
        //       });
            }          
        throw new Error(`INSUFFICIENT_STOCK_PRODUCT_${product.id}`);
      }
    }

    orderItemsData.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      quantity: item.quantity,
      unitPrice: finalUnitPrice
    });
  }

  // On enlève le stock
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }
  });

  // Création commande
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount: total,
      items: {
        create: orderItemsData
      },
      status: "PENDING"
    },
    include: {
      items: true
    }
  });

  await sendNotification({
    userId,
    type: "ORDER_CREATED",
    title: "Commande créée",
    message: `Votre commande #${order.id} a été créée avec succès.`,
    metadata: { orderId: order.id }
  });

  return order;
}
