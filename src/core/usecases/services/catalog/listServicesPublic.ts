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
      zones: { some: { zoneId: filters.zoneId } },
    }),
  };

  const serviceWhere: any = {
    isActive: true,
    provider: providerWhere,
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { provider: { name: { contains: filters.q, mode: "insensitive" } } },
      ],
    }),
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
