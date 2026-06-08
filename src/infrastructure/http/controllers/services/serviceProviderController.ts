// src/infrastructure/http/controllers/services/serviceProviderController.ts
import type { Request, Response } from "express";
import { registerProviderUsecase } from "../../../../core/usecases/services/providers/registerProvider";
import { getMyProviderUsecase } from "../../../../core/usecases/services/providers/getMyProvider";
import { updateProviderUsecase } from "../../../../core/usecases/services/providers/updateProvider";
import { createServiceUsecase } from "../../../../core/usecases/services/offerings/createService";
import { listProviderServicesUsecase } from "../../../../core/usecases/services/offerings/listProviderServices";
import { updateServiceUsecase } from "../../../../core/usecases/services/offerings/updateService";
import { deleteServiceUsecase } from "../../../../core/usecases/services/offerings/deleteService";
import { listProviderBookingsUsecase } from "../../../../core/usecases/services/bookings/listProviderBookings";
import { updateBookingStatusUsecase } from "../../../../core/usecases/services/bookings/updateBookingStatus";
import { sendQuoteUsecase } from "../../../../core/usecases/services/bookings/sendQuote";
import { BookingStatus, ServicePriceType } from "@prisma/client";

// ─── Provider Registration & Profile ────────────────────────────────────────

export async function registerProviderController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { name, bio, type, phone, whatsappNumber, alternatePhone, primaryZoneId,
      hasVehicle, maxRadiusKm, availableDays, openTime, closeTime,
      respectsPrayerTime, zoneIds } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "NAME_AND_PHONE_REQUIRED" });
    }

    const provider = await registerProviderUsecase({
      userId, name, bio, type, phone, whatsappNumber, alternatePhone,
      primaryZoneId: primaryZoneId ? Number(primaryZoneId) : undefined,
      hasVehicle, maxRadiusKm, availableDays, openTime, closeTime,
      respectsPrayerTime, zoneIds,
    });

    return res.status(201).json({ message: "Profil prestataire créé avec succès.", provider });
  } catch (err: any) {
    if (err.message === "ALREADY_A_PROVIDER") {
      return res.status(409).json({ error: "ALREADY_A_PROVIDER", message: "Vous êtes déjà inscrit comme prestataire." });
    }
    console.error("[registerProvider]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function getMyProviderController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const provider = await getMyProviderUsecase(userId);
    return res.json(provider);
  } catch (err: any) {
    if (err.message === "PROVIDER_NOT_FOUND") {
      return res.status(404).json({ error: "PROVIDER_NOT_FOUND", message: "Aucun profil prestataire trouvé." });
    }
    console.error("[getMyProvider]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function updateMyProviderController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const updated = await updateProviderUsecase({ userId, ...req.body });
    return res.json(updated);
  } catch (err: any) {
    if (err.message === "PROVIDER_NOT_FOUND") {
      return res.status(404).json({ error: "PROVIDER_NOT_FOUND" });
    }
    console.error("[updateMyProvider]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── Provider Services (Offerings) ──────────────────────────────────────────

export async function createMyServiceController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { categoryId, name, description, price, priceType, minPrice, maxPrice,
      requiresQuote, images } = req.body;

    if (!categoryId || !name || !description || !priceType) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    const service = await createServiceUsecase({
      userId,
      categoryId: Number(categoryId),
      name,
      description,
      price: price !== undefined ? Number(price) : undefined,
      priceType: priceType as ServicePriceType,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      requiresQuote,
      images,
    });

    return res.status(201).json(service);
  } catch (err: any) {
    if (err.message === "PROVIDER_NOT_FOUND") {
      return res.status(403).json({ error: "NOT_A_PROVIDER", message: "Inscrivez-vous d'abord comme prestataire." });
    }
    console.error("[createMyService]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function listMyServicesController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const services = await listProviderServicesUsecase(userId);
    return res.json(services);
  } catch (err: any) {
    if (err.message === "PROVIDER_NOT_FOUND") {
      return res.status(404).json({ error: "PROVIDER_NOT_FOUND" });
    }
    console.error("[listMyServices]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function updateMyServiceController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const serviceId = parseInt(req.params.serviceId);
    if (isNaN(serviceId)) return res.status(400).json({ error: "INVALID_ID" });

    const updated = await updateServiceUsecase({ serviceId, userId, ...req.body });
    return res.json(updated);
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ error: "UNAUTHORIZED" });
    if (err.message === "SERVICE_NOT_FOUND") return res.status(404).json({ error: "SERVICE_NOT_FOUND" });
    console.error("[updateMyService]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function deleteMyServiceController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const serviceId = parseInt(req.params.serviceId);
    if (isNaN(serviceId)) return res.status(400).json({ error: "INVALID_ID" });

    await deleteServiceUsecase(serviceId, userId);
    return res.json({ message: "Service désactivé." });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ error: "UNAUTHORIZED" });
    if (err.message === "SERVICE_NOT_FOUND") return res.status(404).json({ error: "SERVICE_NOT_FOUND" });
    console.error("[deleteMyService]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── Provider Bookings ───────────────────────────────────────────────────────

export async function listMyProviderBookingsController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const { status } = req.query;
    const bookings = await listProviderBookingsUsecase({
      userId,
      status: status as BookingStatus | undefined,
    });
    return res.json(bookings);
  } catch (err: any) {
    if (err.message === "PROVIDER_NOT_FOUND") return res.status(404).json({ error: "PROVIDER_NOT_FOUND" });
    console.error("[listMyProviderBookings]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function updateBookingStatusController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const bookingId = parseInt(req.params.bookingId);
    if (isNaN(bookingId)) return res.status(400).json({ error: "INVALID_ID" });

    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: "STATUS_REQUIRED" });

    const updated = await updateBookingStatusUsecase({
      bookingId,
      userId,
      newStatus: status as BookingStatus,
      notes,
    });
    return res.json(updated);
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ error: "UNAUTHORIZED" });
    if (err.message === "BOOKING_NOT_FOUND") return res.status(404).json({ error: "BOOKING_NOT_FOUND" });
    if (err.message?.startsWith("INVALID_TRANSITION")) {
      return res.status(400).json({ error: "INVALID_TRANSITION", message: err.message });
    }
    console.error("[updateBookingStatus]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function sendQuoteController(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const bookingId = parseInt(req.params.bookingId);
    if (isNaN(bookingId)) return res.status(400).json({ error: "INVALID_ID" });

    const { quoteAmount, notes } = req.body;
    if (!quoteAmount) return res.status(400).json({ error: "QUOTE_AMOUNT_REQUIRED" });

    const updated = await sendQuoteUsecase({
      bookingId,
      userId,
      quoteAmount: Number(quoteAmount),
      notes,
    });
    return res.json(updated);
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return res.status(403).json({ error: "UNAUTHORIZED" });
    if (err.message === "BOOKING_NOT_FOUND") return res.status(404).json({ error: "BOOKING_NOT_FOUND" });
    if (err.message === "INVALID_QUOTE_AMOUNT") return res.status(400).json({ error: "INVALID_QUOTE_AMOUNT" });
    if (err.message === "QUOTE_NOT_ALLOWED_AT_THIS_STAGE") {
      return res.status(400).json({ error: "QUOTE_NOT_ALLOWED_AT_THIS_STAGE" });
    }
    console.error("[sendQuote]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
