// src/infrastructure/http/routes/brandRoutes.ts
import express from "express";
import { createBrandController, listBrandsController, getBrandController }
  from "../controllers/brandController";

import { requireAuth } from "../middlewares/auth/requireAuth";
import { requireRole } from "../middlewares/auth/requireRole";
import {
  assignCategoriesToBrandController,
  getBrandCategoriesController
} from "../controllers/brandCategoryController";
import {
  approveBrandController,
  rejectBrandController,
  listPendingBrandsController
} from "../controllers/admin/adminBrandController";

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
 *     summary: Liste toutes les marques (actives uniquement pour public)
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
 *     summary: Créer une nouvelle marque (demande de devenir vendeur)
 *     description: Any authenticated user can create a brand. The brand will be pending admin approval.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               primaryColor: { type: string }
 *               secondaryColor: { type: string }
 *               logoUrl: { type: string }
 *     responses:
 *       201:
 *         description: Marque créée (en attente d'approbation)
 */
router.post("/", requireAuth, createBrandController);

// =====================
// ADMIN APPROVAL ROUTES
// =====================

/**
 * @swagger
 * /api/brands/admin/pending:
 *   get:
 *     summary: Liste les marques en attente d'approbation (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des marques en attente
 */
router.get("/admin/pending", requireAuth, requireRole("ADMIN"), listPendingBrandsController);

/**
 * @swagger
 * /api/brands/{brandId}/approve:
 *   post:
 *     summary: Approuver une marque (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Marque approuvée, vendeur activé
 */
router.post("/:brandId/approve", requireAuth, requireRole("ADMIN"), approveBrandController);

/**
 * @swagger
 * /api/brands/{brandId}/reject:
 *   post:
 *     summary: Rejeter une marque (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Marque rejetée
 */
router.post("/:brandId/reject", requireAuth, requireRole("ADMIN"), rejectBrandController);

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
router.put("/:brandId/categories", requireAuth, requireRole("ADMIN"), assignCategoriesToBrandController);

export default router;

