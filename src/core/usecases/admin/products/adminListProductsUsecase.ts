import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminListProductsUsecase(params: {
  page: number;
  pageSize: number;
  q?: string;
  isActive?: boolean;
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK";
}) {
  const { page, pageSize, q, isActive, stockStatus } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (typeof isActive === "boolean") where.isActive = isActive;

  if (stockStatus) {
    if (stockStatus === "IN_STOCK") where.stock = { gt: 0 };
    if (stockStatus === "OUT_OF_STOCK") where.stock = { lte: 0 };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        isActive: true,
        imageUrl: true,
        createdAt: true,
        brand: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return { total, page, pageSize, items };
}