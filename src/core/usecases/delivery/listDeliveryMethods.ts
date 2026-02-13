import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listDeliveryMethods() {
    return await prisma.deliveryMethod.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            code: true,
            isActive: true
        }
    });
}
