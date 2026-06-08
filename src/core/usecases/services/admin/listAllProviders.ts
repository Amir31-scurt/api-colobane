// src/core/usecases/services/admin/listAllProviders.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { VerificationLevel } from "@prisma/client";

interface ListAllProvidersInput {
  q?: string;
  verificationLevel?: VerificationLevel;
  isVerified?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listAllProvidersUsecase(input: ListAllProvidersInput) {
  const page = input.page ?? 1;
  const pageSize = Math.min(input.pageSize ?? 20, 100);
  const skip = (page - 1) * pageSize;

  const where: any = {
    ...(input.verificationLevel && { verificationLevel: input.verificationLevel }),
    ...(input.isVerified !== undefined && { isVerified: input.isVerified }),
    ...(input.q && {
      OR: [
        { name: { contains: input.q, mode: "insensitive" } },
        { phone: { contains: input.q } },
        { user: { email: { contains: input.q, mode: "insensitive" } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.serviceProvider.findMany({
      where,
      include: {
        user: { select: { email: true, name: true, phone: true, createdAt: true } },
        primaryZone: true,
        wallet: true,
        _count: { select: { services: true, bookings: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.serviceProvider.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
