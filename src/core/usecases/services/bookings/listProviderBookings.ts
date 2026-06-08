// src/core/usecases/services/bookings/listProviderBookings.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { BookingStatus } from "@prisma/client";

interface ListProviderBookingsInput {
  userId: number;
  status?: BookingStatus;
}

export async function listProviderBookingsUsecase(input: ListProviderBookingsInput) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: input.userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  return prisma.booking.findMany({
    where: {
      providerId: provider.id,
      ...(input.status && { status: input.status }),
    },
    include: {
      service: { include: { category: true } },
      customer: { select: { name: true, phone: true, avatarUrl: true } },
      zone: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
