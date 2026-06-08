// src/core/usecases/services/bookings/listMyBookings.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function listMyBookingsUsecase(customerId: number) {
  return prisma.booking.findMany({
    where: { customerId },
    include: {
      service: { include: { category: true } },
      provider: {
        select: { name: true, phone: true, whatsappNumber: true, avatarUrl: true, avgRating: true },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
