import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listDeliveryZonesUsecase() {
    return prisma.deliveryZone.findMany({
        orderBy: { createdAt: 'desc' }
    });
}
