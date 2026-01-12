import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { NotificationType } from "../../constants/notificationTypes";
import { buildNotificationContent } from "../../factories/notificationFactory";
import { calculateFinalPrice } from "../../helpers/calculateFinalPrice";
import { sendNotification } from "../../services/notificationService";
import { calculateDistance, calculateDeliveryFee } from "../../helpers/geoUtils";
import { generateUniqueOrderNumber } from "../../helpers/orderNumberGenerator";

interface OrderItemInput {
  productId: number;
  variantId?: number;
  quantity: number;
}

interface CreateOrderInput {
  userId: number;
  items: OrderItemInput[];
  // New Delivery Inputs
  deliveryMethodId: number;
  deliveryLocationId?: number; // Optional if Self-Collect, but good to have
  shippingAddress: string;
  paymentProvider: 'WAVE' | 'ORANGE_MONEY' | 'CASH';
}

export async function createOrderUsecase(input: CreateOrderInput) {
  const { userId, items, deliveryMethodId, deliveryLocationId, shippingAddress, paymentProvider } = input;

  if (!items || items.length === 0) {
    throw new Error("EMPTY_ORDER");
  }

  // 1. Fetch Delivery Method
  const deliveryMethod = await prisma.deliveryMethod.findUnique({
    where: { id: deliveryMethodId }
  });

  if (!deliveryMethod) throw new Error("INVALID_DELIVERY_METHOD");

  // 2. Fetch Products with Brand & Location Info
  const productIds = items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      brand: { 
        include: { 
          promotions: true,
          location: { include: { deliveryZone: true } } // Fetch Brand Location
        } 
      },
      promotions: true,
      categories: { include: { promotions: true } },
      variants: true
    }
  });

  if (products.length !== productIds.length) {
    throw new Error("INVALID_PRODUCT");
  }

  // 3. Delivery Fee Calculation Logic
  let totalDeliveryFee = 0;
  let deliveryZoneId: number | null = null;
  
  if (deliveryMethod.code === 'SELF_COLLECT') {
     // Fee is always 0 for pickup
     totalDeliveryFee = 0;
  } else {
     // STANDARD DELIVERY
     if (!deliveryLocationId) throw new Error("DELIVERY_LOCATION_REQUIRED");

     const deliveryLocation = await prisma.referenceLocation.findUnique({
       where: { id: deliveryLocationId },
       include: { deliveryZone: true }
     });

     if (!deliveryLocation) throw new Error("INVALID_DELIVERY_LOCATION");
     
     // Set primary zone for order reference (e.g. for analytics)
     deliveryZoneId = deliveryLocation.deliveryZoneId;

     // Group products by Brand to calculate distance per vendor
     // (Simple version: Sum of distances or Max distance? Usually sum of separate deliveries)
     const brandIds = new Set(products.map(p => p.brandId));
     
     for (const brandId of brandIds) {
        const brandProduct = products.find(p => p.brandId === brandId);
        const brand = brandProduct?.brand;

        if (!brand || !brand.location) {
           // Fallback if brand has no location set yet: Use a default or throw
           // For migration safety: use default fee
           console.warn(`Brand ${brandId} has no location. Using fallback fee.`);
           totalDeliveryFee += 1500; 
           continue;
        }

        const distance = calculateDistance(
           brand.location.latitude, brand.location.longitude,
           deliveryLocation.latitude, deliveryLocation.longitude
        );

        // Use Zone base fee from the Brand's zone or Delivery Zone? 
        // Usually, the cost depends on the trip. Let's use Delivery Zone base fee.
        const baseFee = deliveryLocation.deliveryZone?.baseFee || 1500; // Fallback
        const fee = calculateDeliveryFee(distance, baseFee);
        
        totalDeliveryFee += fee;
     }
  }

  // 4. Calculate Order Total
  let itemsTotal = 0;
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
    itemsTotal += lineTotal;

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

          // Notify Admins about low stock
          try {
             const { broadcastToAdmins } = await import("../../services/notificationService");
             await broadcastToAdmins(
                NotificationType.LOW_STOCK,
                "Stock Critique",
                `Le produit "${product.name}" (ID: ${product.id}) est presque épuisé (${product.stock} restants).`,
                { productId: product.id, productName: product.name, currentStock: product.stock }
             );
          } catch (err) {
              console.error("Failed to notify admins of low stock:", err);
          }
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

  // 5. Update Stock
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

  // 6. Generate Unique Order Number
  const orderNumber = await generateUniqueOrderNumber(prisma);

  // 7. Create Order
  const finalTotalAmount = itemsTotal + totalDeliveryFee;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      totalAmount: finalTotalAmount,
      deliveryFee: totalDeliveryFee,
      deliveryMethodId: deliveryMethod.id,
      deliveryLocationId: deliveryLocationId,
      deliveryZoneId: deliveryZoneId,
      shippingAddress: shippingAddress,
      items: {
        create: orderItemsData
      },
      Payment: {
        create: {
          provider: paymentProvider,
          amount: finalTotalAmount,
          currency: 'XOF',
          status: paymentProvider === 'CASH' ? 'PENDING' : 'INITIATED'
        }
      },
      status: "PENDING"
    },
    include: {
      items: true,
      Payment: true
    }
  });

  await sendNotification({
    userId,
    type: "ORDER_CREATED",
    title: "Commande créée",
    message: `Votre commande #${orderNumber} a été créée avec succès. Montant total: ${finalTotalAmount} FCFA.`,
    metadata: { orderId: order.id, orderNumber, totalAmount: finalTotalAmount }
  });

  // Notify Admins
  try {
     const { broadcastToAdmins } = await import("../../services/notificationService");
     await broadcastToAdmins(
        NotificationType.ORDER_CREATED,
        "Nouvelle Commande",
        `Nouvelle commande #${orderNumber} d'un montant de ${finalTotalAmount} FCFA.`,
        { orderId: order.id, orderNumber, amount: finalTotalAmount }
     );
  } catch (err) {
      console.error("Failed to notify admins of new order:", err);
  }

  return order;
}
