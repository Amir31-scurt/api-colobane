// src/core/usecases/services/bookings/sendQuote.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

interface SendQuoteInput {
  bookingId: number;
  userId: number;   // Provider's userId
  quoteAmount: number;
  notes?: string;
}

export async function sendQuoteUsecase(input: SendQuoteInput) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: input.userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.providerId !== provider.id) throw new Error("UNAUTHORIZED");
  if (!["PENDING", "NEGOTIATING"].includes(booking.status)) {
    throw new Error("QUOTE_NOT_ALLOWED_AT_THIS_STAGE");
  }
  if (input.quoteAmount <= 0) throw new Error("INVALID_QUOTE_AMOUNT");

  return prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      quoteAmount: input.quoteAmount,
      status: "NEGOTIATING",
      ...(input.notes && { notes: input.notes }),
    },
    include: {
      customer: { select: { name: true, phone: true } },
      service: { include: { category: true } },
    },
  });
}
