// src/core/usecases/categories/updateCategory.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface UpdateCategoryInput {
    name?: string;
    slug?: string;
    isGlobal?: boolean;
}

export async function updateCategoryUsecase(id: number, input: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({
        where: { id }
    });

    if (!existing) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    const category = await prisma.category.update({
        where: { id },
        data: {
            ...input,
        }
    });

    return category;
}
