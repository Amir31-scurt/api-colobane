// src/core/usecases/services/admin/listAllBookings.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { BookingStatus } from "@prisma/client";

interface ListAllBookingsInput {
  status?: BookingStatus;
  page?: number;
  pageSize?: number;
}

export async function listAllBookingsUsecase(input: ListAllBookingsInput) {
  const page = input.page ?? 1;
  const pageSize = Math.min(input.pageSize ?? 20, 100);
  const skip = (page - 1) * pageSize;

  const where: any = {
    ...(input.status && { status: input.status }),
  };

  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        service: { include: { category: true } },
        customer: { select: { name: true, phone: true, email: true } },
        provider: { select: { name: true, phone: true, verificationLevel: true } },
        zone: true,
        commission: true,
        review: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.booking.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
