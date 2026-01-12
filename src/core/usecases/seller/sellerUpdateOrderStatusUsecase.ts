import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { OrderStatus } from "@prisma/client";
import { broadcastToAdmins, sendNotification } from "../../services/notificationService";

export async function sellerUpdateOrderStatusUsecase(userId: number, orderId: number, newStatus: string) {
    // 1. Verify ownership (Seller must have items in this order)
    const brand = await prisma.brand.findFirst({
        where: { ownerId: userId }
    });

    if (!brand) throw new Error("NO_BRAND_FOUND");

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: { product: true }
            },
            user: true
        }
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");

    const sellerHasItems = order.items.some(item => item.product.brandId === brand.id);
    if (!sellerHasItems) throw new Error("FORBIDDEN_ACCESS");

    // 2. Update Status
    // Convert string to enum
    const statusEnum = newStatus as OrderStatus;
    if (!Object.values(OrderStatus).includes(statusEnum)) {
        throw new Error("INVALID_STATUS");
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: statusEnum,
            statusHistory: {
                create: {
                    status: statusEnum,
                    changedBy: userId, // Seller ID
                    note: `Status updated by seller ${brand.name}`
                }
            }
        }
    });

    // 3. Notify Customer
    try {
        await sendNotification({
            userId: order.userId,
            type: "ORDER_STATUS_CHANGED",
            title: "Mise à jour de commande",
            message: `Le statut de votre commande #${order.orderNumber || order.id} est maintenant : ${newStatus}.`,
            metadata: { orderId: order.id, status: newStatus }
        });
    } catch (e) {
        console.error("Failed to notify customer:", e);
    }

    return updatedOrder;
}
