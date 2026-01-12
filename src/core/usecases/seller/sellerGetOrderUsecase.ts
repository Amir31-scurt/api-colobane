import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function sellerGetOrderUsecase(userId: number, orderId: number) {
    // 1. Get seller's brand to ensure ownership logic?
    // Actually, orders are linked to brand via products? 
    // Wait, the Order model links to User (Customer). 
    // Sellers see orders containing their products.
    // In a marketplace, an Order might contain items from multiple sellers.
    // So a seller should only see items belonging to them in that order.

    // Steps:
    // 1. Find the order.
    // 2. Filter items that belong to the seller's brand.
    // 3. If no items belong to seller, throw Forbidden.
    
    const brand = await prisma.brand.findFirst({
        where: { ownerId: userId }
    });

    if (!brand) throw new Error("NO_BRAND_FOUND");

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },
            items: {
                include: {
                    product: true,
                    variant: true
                }
            },
            deliveryMethod: true,
            deliveryLocation: {
                include: {
                    deliveryZone: true
                }
            },
            Payment: true,
            statusHistory: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!order) throw new Error("ORDER_NOT_FOUND");

    // Filter items belonging to this seller
    const sellerItems = order.items.filter(item => item.product.brandId === brand.id);

    if (sellerItems.length === 0) {
        throw new Error("FORBIDDEN_ACCESS");
    }

    // Return the order but maybe with only relevant items?
    // For now, let's return the full order structure but with filtered items
    return {
        ...order,
        items: sellerItems,
        // We might want to calculate total specific to this seller?
        // sellerTotal: sellerItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    };
}
