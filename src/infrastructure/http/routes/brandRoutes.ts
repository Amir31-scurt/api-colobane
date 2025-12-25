// src/infrastructure/http/routes/brandRoutes.ts
import express from "express";
import { createBrandController, listBrandsController, getBrandController }
  from "../controllers/brandController";

import { authRequired, isAdmin } from "../middlewares/authMiddleware";
import {
  assignCategoriesToBrandController,
  getBrandCategoriesController
} from "../controllers/brandCategoryController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Gestion des marques de produits
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Liste toutes les marques
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Liste de marques
 */
router.get("/", listBrandsController);

/**
 * @swagger
 * /api/brands/{slug}:
 *   get:
 *     summary: Récupère une marque par son slug
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la marque
 */
router.get("/:slug", getBrandController);

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Créer une nouvelle marque
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, ownerId]
 *             properties:
 *               name: { type: string }
 *               ownerId: { type: number }
 *               logoUrl: { type: string }
 *     responses:
 *       201:
 *         description: Marque créée
 */
router.post("/", authRequired, isAdmin, createBrandController);

/**
 * @swagger
 * /api/brands/{brandId}/categories:
 *   get:
 *     summary: Liste les catégories associées à une marque
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Liste de catégories
 */
router.get("/:brandId/categories", getBrandCategoriesController);

/**
 * @swagger
 * /api/brands/{brandId}/categories:
 *   put:
 *     summary: Assigne des catégories à une marque
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryIds]
 *             properties:
 *               categoryIds:
 *                 type: array
 *                 items: { type: number }
 *     responses:
 *       200:
 *         description: Catégories assignées
 */
router.put("/:brandId/categories", authRequired, isAdmin, assignCategoriesToBrandController);

export default router;
