// src/infrastructure/http/routes/productRoutes.ts
import express from "express";
import {
  createProductController,
  updateProductController,
  listProductsController,
  getProductController,
  setImagesController,
  setVariantsController,
  searchProductsController,
  advancedSearchProductsController
} from "../controllers/productController.ts";

import { authRequired, isSeller, isAdmin } from "../middlewares/authMiddleware.ts";

const router = express.Router();

// Liste produits
router.get("/", listProductsController);

// Recherche produits
router.get("/search", searchProductsController);

// Détails produit
router.get("/:slug", getProductController);

// Création produit (SELLER ou ADMIN)
router.post("/", authRequired, isSeller, createProductController);

// Update produit
router.put("/:productId", authRequired, isSeller, updateProductController);

// Images
router.put("/:productId/images", authRequired, isSeller, setImagesController);

// Variants
router.put("/:productId/variants", authRequired, isSeller, setVariantsController);

router.get("/search/advanced", advancedSearchProductsController);

export default router;
