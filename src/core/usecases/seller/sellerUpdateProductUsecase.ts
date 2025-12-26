import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface VariantInput {
    id?: number;
    name: string;
    price?: number;
    stock: number;
    option1?: string;
    option2?: string;
    option3?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
}

type UpdateProductDTO = {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
    thumbnailUrl?: string;
    isActive?: boolean;
    categoryId?: number;
    variants?: VariantInput[];
};

export async function sellerUpdateProductUsecase(userId: number, productId: number, data: UpdateProductDTO) {
    // Ownership check is done by middleware

    const { categoryId, variants, ...rest } = data;

    const product = await prisma.product.update({
        where: { id: productId },
        data: {
            ...rest,
            ...(categoryId && {
                categories: {
                    set: [{ id: categoryId }]
                }
            }),
            ...(variants && {
                variants: {
                    deleteMany: {},
                    create: variants.map(v => ({
                        name: v.name,
                        price: v.price ?? null,
                        stock: v.stock,
                        option1: v.option1,
                        option2: v.option2,
                        option3: v.option3,
                        imageUrl: v.imageUrl ?? null,
                        thumbnailUrl: v.thumbnailUrl ?? null
                    }))
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
            meta: data as any,
        }
    });

    return product;
}
