// src/core/usecases/categories/deleteCategory.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function deleteCategoryUsecase(id: number) {
    const existing = await prisma.category.findUnique({
        where: { id }
    });

    if (!existing) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    // Check if category has products
    const productsCount = await prisma.product.count({
        where: {
            categories: {
                some: { id }
            }
        }
    });

    if (productsCount > 0) {
        throw new Error("CATEGORY_HAS_PRODUCTS");
    }

    await prisma.category.delete({
        where: { id }
    });

    return { success: true };
}
