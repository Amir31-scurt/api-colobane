import type { Request, Response } from "express";
import { createPromotionUsecase } from "../../../core/usecases/promotions/createPromotionUsecase";
import { listPromotionsUsecase } from "../../../core/usecases/promotions/listPromotionsUsecase";
import { getPromotionUsecase } from "../../../core/usecases/promotions/getPromotionUsecase";
import { updatePromotionUsecase } from "../../../core/usecases/promotions/updatePromotionUsecase";
import { togglePromotionUsecase } from "../../../core/usecases/promotions/togglePromotionUsecase";
import { assignPromotionToProductsUsecase } from "../../../core/usecases/promotions/assignPromotionToProductsUsecase";
import { assignPromotionToBrandsUsecase } from "../../../core/usecases/promotions/assignPromotionToBrandsUsecase";
import { assignPromotionToCategoriesUsecase } from "../../../core/usecases/promotions/assignPromotionToCategoriesUsecase";

export async function createPromotionController(req: Request, res: Response) {
  try {
    const body = req.body;
    const promo = await createPromotionUsecase({
      name: body.name,
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
      isActive: body.isActive,
      productIds: body.productIds,
      brandIds: body.brandIds,
      categoryIds: body.categoryIds
    });

    return res.status(201).json(promo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function listPromotionsController(req: Request, res: Response) {
  const promos = await listPromotionsUsecase();
  return res.json(promos);
}

export async function getPromotionController(req: Request, res: Response) {
  try {
    const id = Number(req.params.promotionId);
    const promo = await getPromotionUsecase(id);
    return res.json(promo);
  } catch (err: any) {
    if (err.message === "PROMOTION_NOT_FOUND") {
      return res.status(404).json({ message: "Promotion introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function updatePromotionController(req: Request, res: Response) {
  try {
    const id = Number(req.params.promotionId);
    const body = req.body;

    const promo = await updatePromotionUsecase(id, {
      name: body.name,
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      isActive: body.isActive
    });

    return res.json(promo);
  } catch (err: any) {
    if (err.message === "PROMOTION_NOT_FOUND") {
      return res.status(404).json({ message: "Promotion introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function togglePromotionController(req: Request, res: Response) {
  try {
    const id = Number(req.params.promotionId);
    const { isActive } = req.body;

    const promo = await togglePromotionUsecase(id, Boolean(isActive));
    return res.json(promo);
  } catch (err: any) {
    if (err.message === "PROMOTION_NOT_FOUND") {
      return res.status(404).json({ message: "Promotion introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function assignPromotionToProductsController(req: Request, res: Response) {
  try {
    const id = Number(req.params.promotionId);
    const { productIds } = req.body;

    const promo = await assignPromotionToProductsUsecase(id, productIds);
    return res.json(promo);
  } catch (err: any) {
    if (err.message === "PROMOTION_NOT_FOUND") {
      return res.status(404).json({ message: "Promotion introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function assignPromotionToBrandsController(req: Request, res: Response) {
  try {
    const id = Number(req.params.promotionId);
    const { brandIds } = req.body;

    const promo = await assignPromotionToBrandsUsecase(id, brandIds);
    return res.json(promo);
  } catch (err: any) {
    if (err.message === "PROMOTION_NOT_FOUND") {
      return res.status(404).json({ message: "Promotion introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function assignPromotionToCategoriesController(req: Request, res: Response) {
  try {
    const id = Number(req.params.promotionId);
    const { categoryIds } = req.body;

    const promo = await assignPromotionToCategoriesUsecase(id, categoryIds);
    return res.json(promo);
  } catch (err: any) {
    if (err.message === "PROMOTION_NOT_FOUND") {
      return res.status(404).json({ message: "Promotion introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}
