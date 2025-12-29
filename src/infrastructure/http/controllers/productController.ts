// src/infrastructure/http/controllers/productController
import type { Request, Response } from "express";
import { createProductUsecase } from "../../../core/usecases/products/createProductUsecase";
import { updateProductUsecase } from "../../../core/usecases/products/updateProductUsecase";
import { listProductsUsecase } from "../../../core/usecases/products/listProductsUsecase";
import { getProductUsecase } from "../../../core/usecases/products/getProductUsecase";
import { setImagesUsecase } from "../../../core/usecases/products/setImagesUsecase";
import { setVariantsUsecase } from "../../../core/usecases/products/setVariantsUsecase";
import { searchProductsUsecase } from "../../../core/usecases/products/searchProductsUsecase";
import { advancedSearchProductsUsecase } from "../../../core/usecases/products/advancedSearchProductsUsecase";
import { mapProductWithFinalPrice } from "../../../core/appers/productMapper";
import { cacheGet, cacheSet } from "../../cache/cache";

export async function createProductController(req: Request, res: Response) {
  try {
    const product = await createProductUsecase(req.body);
    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur interne lors de la création du produit" });
  }
}

export async function updateProductController(req: Request, res: Response) {
  try {
    const id = Number(req.params.productId);
    const updated = await updateProductUsecase(id, req.body);
    return res.json(updated);
  } catch (err: any) {
    if (err.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne lors de la mise à jour" });
  }
}

export async function listProductsController(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search?.toString();
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const brandId = req.query.brandId ? Number(req.query.brandId) : undefined;

    console.log("listProductsController query:", req.query);
    console.log("listProductsController parsed search:", search);


    const result = await listProductsUsecase({
      page,
      limit,
      search,
      categoryId,
      brandId
    });

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur lors de la récupération des produits" });
  }
}

export async function getProductController(req: Request, res: Response) {
  try {
    const product = await getProductUsecase(req.params.slug);
    return res.json(product);
  } catch (err: any) {
    if (err.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne lors de la récupération du produit" });
  }
}

export async function setImagesController(req: Request, res: Response) {
  try {
    const id = Number(req.params.productId);
    const urls: string[] = req.body.urls;
    await setImagesUsecase(id, urls);
    return res.json({ message: "Images mises à jour" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur interne update images" });
  }
}

export async function setVariantsController(req: Request, res: Response) {
  try {
    const id = Number(req.params.productId);
    const variants = req.body.variants;

    // Chaque variant peut inclure: name, price, stock, option1, option2, imageUrl, thumbnailUrl…

    await setVariantsUsecase(id, variants);

    return res.json({ message: "Variantes mises à jour avec image support" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur interne update variants" });
  }
}


export async function searchProductsController(req: Request, res: Response) {
  const q = req.query.q?.toString() || "";
  const results = await searchProductsUsecase(q);
  return res.json(results);
}

export async function advancedSearchProductsController(req: Request, res: Response) {
  const query = req.query.q?.toString() || "";
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const phone = req.query.phone?.toString();
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const categoryIds = req.query.categoryIds
    ? req.query.categoryIds.toString().split(",").map(Number)
    : undefined;
  const brandIds = req.query.brandIds
    ? req.query.brandIds.toString().split(",").map(Number)
    : undefined;
  const hasPromotion = req.query.hasPromotion === "true";

  const cacheKey = `search:v1:q=${query}|phone=${phone ?? ""}|min=${minPrice ?? ""}|max=${maxPrice ?? ""}|cat=${(categoryIds ?? []).join("-")}|brand=${(brandIds ?? []).join("-")}|promo=${hasPromotion}`;

  const cached = await cacheGet<any[]>(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const products = await advancedSearchProductsUsecase({
    query,
    phone,
    minPrice,
    maxPrice,
    categoryIds,
    brandIds,
    hasPromotion
  });

  const mapped = products.map((p) => mapProductWithFinalPrice(p));
  await cacheSet(cacheKey, mapped, 60); // 60s TTL

  return res.json(mapped);
}