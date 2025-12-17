// src/infrastructure/http/controllers/brandController

import type { Request, Response } from "express";
import { createBrandUsecase } from "../../../core/usecases/brands/createBrand";
import { listBrandsUsecase } from "../../../core/usecases/brands/listBrands";
import { getBrandBySlugUsecase } from "../../../core/usecases/brands/getBrandBySlug";

// src/infrastructure/http/controllers/brandController

export async function createBrandController(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user.id; // récupéré depuis le middleware auth
  
      const brand = await createBrandUsecase({
        ...req.body,
        ownerId
      });
  
      return res.status(201).json(brand);
    } catch (err: any) {
      if (err.message === "BRAND_ALREADY_EXISTS") {
        return res.status(409).json({ message: "Une marque avec ce slug existe déjà." });
      }
      console.error(err);
      return res.status(500).json({ message: "Erreur interne." });
    }
  }
  

export async function listBrandsController(req: Request, res: Response) {
  const brands = await listBrandsUsecase();
  return res.json(brands);
}

export async function getBrandController(req: Request, res: Response) {
  try {
    const slug = req.params.slug;
    const brand = await getBrandBySlugUsecase(slug);
    return res.json(brand);
  } catch (err: any) {
    if (err.message === "BRAND_NOT_FOUND") {
      return res.status(404).json({ message: "Marque introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}
