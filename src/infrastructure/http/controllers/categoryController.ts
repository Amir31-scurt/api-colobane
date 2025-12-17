// src/infrastructure/http/controllers/categoryController
import type { Request, Response } from "express";
import { createCategoryUsecase } from "../../../core/usecases/categories/createCategory";
import { listCategoriesUsecase } from "../../../core/usecases/categories/listCategories";
import { getCategoryBySlugUsecase } from "../../../core/usecases/categories/getCategoryBySlug";

export async function createCategoryController(req: Request, res: Response) {
  try {
    const category = await createCategoryUsecase(req.body);
    return res.status(201).json(category);
  } catch (err: any) {
    if (err.message === "CATEGORY_ALREADY_EXISTS") {
      return res.status(409).json({ message: "Cette catégorie existe déjà." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function listCategoriesController(req: Request, res: Response) {
  const categories = await listCategoriesUsecase();
  return res.json(categories);
}

export async function getCategoryController(req: Request, res: Response) {
  try {
    const slug = req.params.slug;
    const category = await getCategoryBySlugUsecase(slug);
    return res.json(category);
  } catch (err: any) {
    if (err.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}
