// src/core/usecases/services/catalog/listServicesPublic.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

interface ListServicesFilter {
  zoneId?: number;
  categoryId?: number;
  urgency?: string;
  isVerified?: boolean;
  isAvailableNow?: boolean;
  q?: string;
  page?: number;
  pageSize?: number;
}

export async function listServicesPublicUsecase(filters: ListServicesFilter) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 20, 50);
  const skip = (page - 1) * pageSize;

  const providerWhere: any = {
    ...(filters.isVerified && { isVerified: true }),
    ...(filters.isAvailableNow && { isAvailableNow: true }),
    ...(filters.zoneId && {
      OR: [
        { primaryZoneId: filters.zoneId },
        { zones: { some: { zoneId: filters.zoneId } } },
      ],
    }),
  };

  const AND_conditions: any[] = [];

  if (filters.categoryId) {
    AND_conditions.push({ categoryId: filters.categoryId });
  }

  if (filters.q && filters.q.trim()) {
    const rawSearch = filters.q.trim();
    // Split search into individual words (e.g. "tailleur parcelle" => ["tailleur", "parcelle"])
    const terms = rawSearch.split(/\s+/).filter(Boolean);

    for (const term of terms) {
      AND_conditions.push({
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { category: { name: { contains: term, mode: "insensitive" } } },
          { category: { nameWolof: { contains: term, mode: "insensitive" } } },
          { category: { slug: { contains: term, mode: "insensitive" } } },
          { provider: { name: { contains: term, mode: "insensitive" } } },
          { provider: { bio: { contains: term, mode: "insensitive" } } },
          { provider: { primaryZone: { name: { contains: term, mode: "insensitive" } } } },
          { provider: { primaryZone: { city: { contains: term, mode: "insensitive" } } } },
          { provider: { zones: { some: { zone: { name: { contains: term, mode: "insensitive" } } } } } },
          { provider: { zones: { some: { zone: { city: { contains: term, mode: "insensitive" } } } } } },
        ],
      });
    }
  }

  const serviceWhere: any = {
    isActive: true,
    provider: providerWhere,
    ...(AND_conditions.length > 0 && { AND: AND_conditions }),
  };

  const [items, total] = await Promise.all([
    prisma.service.findMany({
      where: serviceWhere,
      include: {
        category: true,
        provider: {
          include: {
            primaryZone: true,
            zones: { include: { zone: true } },
            _count: { select: { reviews: true } },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: [
        { provider: { avgRating: "desc" } },
        { provider: { totalMissions: "desc" } },
        { createdAt: "desc" },
      ],
    }),
    prisma.service.count({ where: serviceWhere }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
