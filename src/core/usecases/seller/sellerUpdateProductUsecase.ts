import { prisma } from "../../../infrastructure/prisma/prismaClient";

type UpdateProductDTO = {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
    thumbnailUrl?: string;
    isActive?: boolean;
    categoryId?: number;
};

export async function sellerUpdateProductUsecase(userId: number, productId: number, data: UpdateProductDTO) {
    // Ownership check is done by middleware

    const { categoryId, ...rest } = data;

    const product = await prisma.product.update({
        where: { id: productId },
        data: {
            ...rest,
            ...(categoryId && {
                categories: {
                    set: [{ id: categoryId }]
                }
            }),
            updatedAt: new Date(),
        },
    });

    await prisma.auditLog.create({
        data: {
            action: "PRODUCT_UPDATED",
            actorId: userId,
            entityType: "Product",
            entityId: productId.toString(),
            meta: data,
        }
    });

    return product;
}
