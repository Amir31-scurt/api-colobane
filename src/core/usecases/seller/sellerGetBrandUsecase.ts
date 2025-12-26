import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function sellerGetBrandUsecase(userId: number) {
    const brand = await prisma.brand.findFirst({
        where: { ownerId: userId }
    });

    if (!brand) return null; // Or throw error? Null is fine, frontend handles "Create Brand" maybe.

    return brand;
}
