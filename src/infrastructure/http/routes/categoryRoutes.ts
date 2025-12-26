// src/infrastructure/http/routes/categoryRoutes.ts
import express from "express";

import {
  createCategoryController,
  listCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController
} from "../controllers/categoryController";

import { authRequired, isAdmin } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestion des catégories de produits
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Liste toutes les catégories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste de catégories
 */
router.get("/", listCategoriesController);

/**
 * @swagger
 * /api/categories/{slug}:
 *   get:
 *     summary: Récupère une catégorie par son slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la catégorie
 */
router.get("/:slug", getCategoryController);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               parentId: { type: number }
 *     responses:
 *       201:
 *         description: Catégorie créée
 */
router.post("/", authRequired, isAdmin, createCategoryController);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Modifier une catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               isGlobal: { type: boolean }
 *     responses:
 *       200:
 *         description: Catégorie modifiée
 */
router.patch("/:id", authRequired, isAdmin, updateCategoryController);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Supprimer une catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Catégorie supprimée
 */
router.delete("/:id", authRequired, isAdmin, deleteCategoryController);

export default router;
