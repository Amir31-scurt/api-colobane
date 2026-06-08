// src/infrastructure/http/controllers/services/servicePublicController.ts
import type { Request, Response } from "express";
import { listZonesUsecase } from "../../../../core/usecases/services/zones/listZones";
import { listServiceCategoriesUsecase } from "../../../../core/usecases/services/categories/listServiceCategories";
import { listServicesPublicUsecase } from "../../../../core/usecases/services/catalog/listServicesPublic";
import { getServiceByIdUsecase } from "../../../../core/usecases/services/catalog/getServiceById";
import { getProviderPublicUsecase } from "../../../../core/usecases/services/catalog/getProviderPublic";

export async function listZonesController(req: Request, res: Response) {
  try {
    const zones = await listZonesUsecase();
    return res.json(zones);
  } catch (err) {
    console.error("[listZones]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function listServiceCategoriesController(req: Request, res: Response) {
  try {
    const categories = await listServiceCategoriesUsecase();
    return res.json(categories);
  } catch (err) {
    console.error("[listServiceCategories]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function listServicesPublicController(req: Request, res: Response) {
  try {
    const { zoneId, categoryId, isVerified, isAvailableNow, q, page, pageSize } = req.query;
    const result = await listServicesPublicUsecase({
      zoneId: zoneId ? Number(zoneId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      isVerified: isVerified === "true" ? true : undefined,
      isAvailableNow: isAvailableNow === "true" ? true : undefined,
      q: q as string | undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    return res.json(result);
  } catch (err) {
    console.error("[listServicesPublic]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function getServiceByIdController(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "INVALID_ID" });
    const service = await getServiceByIdUsecase(id);
    return res.json(service);
  } catch (err: any) {
    if (err.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({ error: "SERVICE_NOT_FOUND", message: "Service introuvable." });
    }
    console.error("[getServiceById]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function getProviderPublicController(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.providerId);
    if (isNaN(id)) return res.status(400).json({ error: "INVALID_ID" });
    const provider = await getProviderPublicUsecase(id);
    return res.json(provider);
  } catch (err: any) {
    if (err.message === "PROVIDER_NOT_FOUND") {
      return res.status(404).json({ error: "PROVIDER_NOT_FOUND", message: "Prestataire introuvable." });
    }
    console.error("[getProviderPublic]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
