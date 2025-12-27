// src/core/usecases/categories/listCategories
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listCategoriesUsecase(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 100; // Default large for backwards compat if needed, or stick to standard 10
  const search = options?.search || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } }, // Case-insensitive handled by DB collation usually, or use mode: 'insensitive' for postgres
      { slug: { contains: search } }
    ];
  }

  const [total, items] = await prisma.$transaction([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  ]);

  return { items, total };
}
