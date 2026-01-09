import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listDeliveryZones() {
    return await prisma.deliveryZone.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            city: true,
            baseFee: true,
            minAmountFree: true,
            locations: {
                where: { isActive: true },
                select: { id: true, name: true }
            }
        }
    });
}
