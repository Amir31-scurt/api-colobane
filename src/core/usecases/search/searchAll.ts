import { prisma } from "../../../infrastructure/prisma/prismaClient";

export interface SearchResult {
  brands: any[];
  products: any[];
  categories: any[];
}

export async function searchAllUsecase(query: string): Promise<SearchResult> {
  if (!query || typeof query !== "string") {
    return { brands: [], products: [], categories: [] };
  }

  // Sanitize: strip control characters and cap at 80 characters max to prevent DB memory/CPU exhaustion
  const q = query.replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, 80);

  if (q.length === 0) {
    return { brands: [], products: [], categories: [] };
  }

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
      include: {
        brand: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        },
        categories: true
      },
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
