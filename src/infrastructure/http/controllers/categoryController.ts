// src/infrastructure/http/controllers/categoryController
import type { Request, Response } from "express";
import { createCategoryUsecase } from "../../../core/usecases/categories/createCategory";
import { listCategoriesUsecase } from "../../../core/usecases/categories/listCategories";
import { getCategoryBySlugUsecase } from "../../../core/usecases/categories/getCategoryBySlug";
import { updateCategoryUsecase } from "../../../core/usecases/categories/updateCategory";
import { deleteCategoryUsecase } from "../../../core/usecases/categories/deleteCategory";

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
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const q = (req.query.q as string) || "";

  const result = await listCategoriesUsecase({ page, pageSize, search: q });
  return res.json(result);
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

export async function updateCategoryController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const category = await updateCategoryUsecase(id, req.body);
    return res.json(category);
  } catch (err: any) {
    if (err.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}

export async function deleteCategoryController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await deleteCategoryUsecase(id);
    return res.json({ message: "Catégorie supprimée avec succès." });
  } catch (err: any) {
    if (err.message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }
    if (err.message === "CATEGORY_HAS_PRODUCTS") {
      return res.status(400).json({ message: "Impossible de supprimer une catégorie contenant des produits." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne." });
  }
}
