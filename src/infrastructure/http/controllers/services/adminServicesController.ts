// src/infrastructure/http/controllers/services/adminServicesController.ts
import type { Request, Response } from "express";
import { listAllProvidersUsecase } from "../../../../core/usecases/services/admin/listAllProviders";
import { verifyProviderUsecase } from "../../../../core/usecases/services/admin/verifyProvider";
import { listAllBookingsUsecase } from "../../../../core/usecases/services/admin/listAllBookings";
import { prisma } from "../../../prisma/prismaClient";
import { VerificationLevel, BookingStatus } from "@prisma/client";

export async function adminListProvidersController(req: Request, res: Response) {
  try {
    const { q, verificationLevel, isVerified, page, pageSize } = req.query;
    const result = await listAllProvidersUsecase({
      q: q as string | undefined,
      verificationLevel: verificationLevel as VerificationLevel | undefined,
      isVerified: isVerified !== undefined ? isVerified === "true" : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    return res.json(result);
  } catch (err) {
    console.error("[adminListProviders]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminVerifyProviderController(req: Request, res: Response) {
  try {
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) return res.status(400).json({ error: "INVALID_ID" });

    const { verificationLevel, isVerified } = req.body;
    if (!verificationLevel || isVerified === undefined) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const updated = await verifyProviderUsecase({
      providerId,
      verificationLevel: verificationLevel as VerificationLevel,
      isVerified: Boolean(isVerified),
    });
    return res.json({ message: "Statut de vérification mis à jour.", provider: updated });
  } catch (err: any) {
    if (err.message === "PROVIDER_NOT_FOUND") {
      return res.status(404).json({ error: "PROVIDER_NOT_FOUND" });
    }
    console.error("[adminVerifyProvider]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminListBookingsController(req: Request, res: Response) {
  try {
    const { status, page, pageSize } = req.query;
    const result = await listAllBookingsUsecase({
      status: status as BookingStatus | undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    return res.json(result);
  } catch (err) {
    console.error("[adminListBookings]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminServicesStatsController(req: Request, res: Response) {
  try {
    const [totalProviders, verifiedProviders, totalBookings, completedBookings,
      totalRevenue, totalCategories] = await Promise.all([
      prisma.serviceProvider.count(),
      prisma.serviceProvider.count({ where: { isVerified: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.serviceCommission.aggregate({
        where: { status: "CHARGED" },
        _sum: { amount: true },
      }),
      prisma.serviceCategory.count({ where: { isActive: true } }),
    ]);

    return res.json({
      totalProviders,
      verifiedProviders,
      totalBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      totalCategories,
    });
  } catch (err) {
    console.error("[adminServicesStats]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
