// src/core/usecases/categories/createCategory.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

interface CreateCategoryInput {
  name: string;
  slug: string;
  isGlobal?: boolean;
}

export async function createCategoryUsecase(input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { slug: input.slug }
  });

  if (existing) {
    throw new Error("CATEGORY_ALREADY_EXISTS");
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug,
      isGlobal: input.isGlobal ?? true
    }
  });

  return category;
}
