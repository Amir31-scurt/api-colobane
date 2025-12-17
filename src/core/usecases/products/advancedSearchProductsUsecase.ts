import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface SearchInput {
  query: string;
  phone?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: number[];
  brandIds?: number[];
  hasPromotion?: boolean;
}

export async function advancedSearchProductsUsecase(input: SearchInput) {
  const { query, phone, minPrice, maxPrice, categoryIds, brandIds, hasPromotion } = input;

  // filtre basique en Prisma
  const products = await prisma.product.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } }
              ]
            }
          : {},
        minPrice ? { price: { gte: minPrice } } : {},
        maxPrice ? { price: { lte: maxPrice } } : {},
        brandIds ? { brandId: { in: brandIds } } : {},
        categoryIds
          ? {
              categories: {
                some: { id: { in: categoryIds } }
              }
            }
          : {},
          phone
        ? {
            orderItems: {
              some: {
                order: {
                  user: {
                    phone: { contains: phone }
                  }
                }
              }
            }
          }
        : {}
      ]
    },
    include: {
      images: true,
      brand: true,
      categories: true,
      promotions: true,
      variants: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // si hasPromotion → filtrer en mémoire via promotions actives
  const now = new Date();

  const filtered = hasPromotion
    ? products.filter((p) =>
        (p.promotions ?? []).some(
          (promo : any) =>
            promo.isActive &&
            promo.startsAt <= now &&
            promo.endsAt >= now
        )
      )
    : products;

  return filtered;
}
