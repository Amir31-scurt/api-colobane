import type { Request, Response } from "express";
import { assignCategoriesToBrandUsecase } from "../../../core/usecases/brands/assignCategoriesToBrand.ts";
import { getBrandCategoriesUsecase } from "../../../core/usecases/brands/getBrandCategories.ts";

export async function assignCategoriesToBrandController(req: Request, res: Response) {
  try {
    const brandId = Number(req.params.brandId);
    const { categoryIds } = req.body;

    const categories = await assignCategoriesToBrandUsecase(brandId, categoryIds);
    return res.json(categories);
  } catch (err: any) {
    if (err.message === "BRAND_NOT_FOUND")
      return res.status(404).json({ message: "Marque introuvable." });

    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function getBrandCategoriesController(req: Request, res: Response) {
  try {
    const brandId = Number(req.params.brandId);

    const categories = await getBrandCategoriesUsecase(brandId);
    return res.json(categories);
  } catch (err: any) {
    if (err.message === "BRAND_NOT_FOUND")
      return res.status(404).json({ message: "Marque introuvable." });

    return res.status(500).json({ message: "Erreur interne." });
  }
}
