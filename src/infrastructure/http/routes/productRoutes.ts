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
} from "../controllers/productController";

import { authRequired, isSeller, isAdmin } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestion des produits et du catalogue
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Liste tous les produits (avec filtres optionnels)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Liste de produits
 */
router.get("/", listProductsController);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Recherche textuelle de produits
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Résultats de recherche
 */
router.get("/search", searchProductsController);

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     summary: Récupère un produit par son slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du produit
 */
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
