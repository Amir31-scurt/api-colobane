import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function sellerGetProductUsecase(userId: number, productId: number) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            brand: true,
            categories: true,
            images: true,
        }
    });

    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    // Ensure ownership
    if (product.brand.ownerId !== userId) {
        throw new Error("FORBIDDEN");
    }

    return product;
}
