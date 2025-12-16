import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export interface SearchResult {
  brands: any[];
  products: any[];
  categories: any[];
}

export async function searchAllUsecase(query: string): Promise<SearchResult> {
  if (!query || query.trim().length === 0) {
    return { brands: [], products: [], categories: [] };
  }

  const q = query.trim();

  const [brands, products, categories] = await Promise.all([
    prisma.brand.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } }
        ]
      },
      take: 20
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } }
        ],
        isActive: true
      },
      include: { brand: true, categories: true },
      take: 50
    }),
    prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } }
        ]
      },
      take: 20
    })
  ]);

  return { brands, products, categories };
}
