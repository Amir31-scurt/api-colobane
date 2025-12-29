// src/core/usecases/products/listProductsUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { Prisma } from "@prisma/client";

interface ListProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  brandId?: number;
}

export async function listProductsUsecase({
  page = 1,
  limit = 12,
  search,
  categoryId,
  brandId,
}: ListProductsOptions = {}) {
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
      { categories: { some: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  if (categoryId) {
    where.categories = { some: { id: categoryId } };
  }

  if (brandId) {
    where.brandId = brandId;
  }

  const skip = (page - 1) * limit;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        images: true,
        variants: true,
        brand: true,
        categories: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
