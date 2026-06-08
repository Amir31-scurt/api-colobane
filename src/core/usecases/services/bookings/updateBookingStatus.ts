// src/core/usecases/services/bookings/updateBookingStatus.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { BookingStatus } from "@prisma/client";

// Valid transitions to prevent arbitrary status jumps
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:      ["NEGOTIATING", "ACCEPTED", "CANCELLED"],
  NEGOTIATING:  ["ACCEPTED", "CANCELLED"],
  ACCEPTED:     ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS:  ["COMPLETED", "DISPUTED"],
  COMPLETED:    ["DISPUTED"],
  CANCELLED:    [],
  DISPUTED:     ["COMPLETED", "CANCELLED"],
};

interface UpdateBookingStatusInput {
  bookingId: number;
  userId: number;   // The provider's userId
  newStatus: BookingStatus;
  notes?: string;
}

export async function updateBookingStatusUsecase(input: UpdateBookingStatusInput) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: input.userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.providerId !== provider.id) throw new Error("UNAUTHORIZED");

  const allowed = VALID_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(input.newStatus)) {
    throw new Error(`INVALID_TRANSITION: ${booking.status} → ${input.newStatus}`);
  }

  const updated = await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      status: input.newStatus,
      ...(input.notes && { notes: input.notes }),
    },
    include: {
      service: { include: { category: true } },
      customer: { select: { name: true, phone: true } },
    },
  });

  // When completed: increment provider mission count & trigger commission
  if (input.newStatus === "COMPLETED") {
    await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: { totalMissions: { increment: 1 } },
    });

    // Apply lead fee commission (500 FCFA default)
    const LEAD_FEE = 500;
    const wallet = await prisma.providerWallet.findUnique({
      where: { providerId: provider.id },
    });
    if (wallet) {
      await prisma.serviceCommission.create({
        data: {
          bookingId: input.bookingId,
          walletId: wallet.id,
          amount: LEAD_FEE,
          type: "LEAD_FEE",
          status: "CHARGED",
        },
      });
    }
  }

  return updated;
}
