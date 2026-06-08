// src/core/usecases/services/bookings/createReview.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

interface CreateReviewInput {
  bookingId: number;
  customerId: number;
  rating: number;       // 1–5
  comment?: string;
  punctuality?: number; // 1–5
  quality?: number;     // 1–5
  priceValue?: number;  // 1–5
}

export async function createReviewUsecase(input: CreateReviewInput) {
  if (input.rating < 1 || input.rating > 5) throw new Error("INVALID_RATING");

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { review: true },
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.customerId !== input.customerId) throw new Error("UNAUTHORIZED");
  if (booking.status !== "COMPLETED") throw new Error("BOOKING_NOT_COMPLETED");
  if (booking.review) throw new Error("REVIEW_ALREADY_EXISTS");

  // Create review
  const review = await prisma.serviceReview.create({
    data: {
      bookingId: input.bookingId,
      providerId: booking.providerId,
      customerId: input.customerId,
      rating: input.rating,
      comment: input.comment,
      punctuality: input.punctuality,
      quality: input.quality,
      priceValue: input.priceValue,
    },
  });

  // Recalculate provider average rating
  const aggregate = await prisma.serviceReview.aggregate({
    where: { providerId: booking.providerId },
    _avg: { rating: true },
  });

  await prisma.serviceProvider.update({
    where: { id: booking.providerId },
    data: { avgRating: aggregate._avg.rating ?? 0 },
  });

  return review;
}
