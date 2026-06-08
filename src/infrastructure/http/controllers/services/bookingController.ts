// src/infrastructure/http/controllers/services/bookingController.ts
import type { Request, Response } from "express";
import { createBookingUsecase } from "../../../../core/usecases/services/bookings/createBooking";
import { listMyBookingsUsecase } from "../../../../core/usecases/services/bookings/listMyBookings";
import { createReviewUsecase } from "../../../../core/usecases/services/bookings/createReview";
import { UrgencyLevel, ServicePaymentMethod } from "@prisma/client";

export async function createBookingController(req: Request, res: Response) {
  try {
    const customerId = (req as any).auth?.userId;
    const serviceId = parseInt(req.params.serviceId);
    if (isNaN(serviceId)) return res.status(400).json({ error: "INVALID_SERVICE_ID" });

    const { address, description, scheduledDate, isDateFlexible,
      urgency, zoneId, contactPhone, paymentMethod, images } = req.body;

    if (!address || !description) {
      return res.status(400).json({ error: "ADDRESS_AND_DESCRIPTION_REQUIRED" });
    }

    const booking = await createBookingUsecase({
      customerId,
      serviceId,
      address,
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      isDateFlexible,
      urgency: urgency as UrgencyLevel | undefined,
      zoneId: zoneId ? Number(zoneId) : undefined,
      contactPhone,
      paymentMethod: paymentMethod as ServicePaymentMethod | undefined,
      images,
    });

    return res.status(201).json({ message: "Demande envoyée au prestataire.", booking });
  } catch (err: any) {
    if (err.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({ error: "SERVICE_NOT_FOUND" });
    }
    if (err.message === "CANNOT_BOOK_OWN_SERVICE") {
      return res.status(400).json({ error: "CANNOT_BOOK_OWN_SERVICE", message: "Vous ne pouvez pas réserver votre propre service." });
    }
    console.error("[createBooking]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function listMyBookingsController(req: Request, res: Response) {
  try {
    const customerId = (req as any).auth?.userId;
    const bookings = await listMyBookingsUsecase(customerId);
    return res.json(bookings);
  } catch (err) {
    console.error("[listMyBookings]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function createReviewController(req: Request, res: Response) {
  try {
    const customerId = (req as any).auth?.userId;
    const bookingId = parseInt(req.params.bookingId);
    if (isNaN(bookingId)) return res.status(400).json({ error: "INVALID_ID" });

    const { rating, comment, punctuality, quality, priceValue } = req.body;
    if (rating === undefined) return res.status(400).json({ error: "RATING_REQUIRED" });

    const review = await createReviewUsecase({
      bookingId,
      customerId,
      rating: Number(rating),
      comment,
      punctuality: punctuality !== undefined ? Number(punctuality) : undefined,
      quality: quality !== undefined ? Number(quality) : undefined,
      priceValue: priceValue !== undefined ? Number(priceValue) : undefined,
    });

    return res.status(201).json(review);
  } catch (err: any) {
    const errorMap: Record<string, [number, string]> = {
      BOOKING_NOT_FOUND:     [404, "Réservation introuvable."],
      UNAUTHORIZED:          [403, "Accès non autorisé."],
      BOOKING_NOT_COMPLETED: [400, "La mission n'est pas encore terminée."],
      REVIEW_ALREADY_EXISTS: [409, "Vous avez déjà laissé un avis pour cette mission."],
      INVALID_RATING:        [400, "La note doit être entre 1 et 5."],
    };
    const mapped = errorMap[err.message];
    if (mapped) return res.status(mapped[0]).json({ error: err.message, message: mapped[1] });
    console.error("[createReview]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
