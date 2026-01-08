"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/categoryRoutes.ts
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const requireRole_1 = require("../middlewares/auth/requireRole");
const router = express_1.default.Router();
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
router.get("/", categoryController_1.listCategoriesController);
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
router.get("/:slug", categoryController_1.getCategoryController);
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
router.post("/", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), categoryController_1.createCategoryController);
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
router.patch("/:id", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), categoryController_1.updateCategoryController);
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
router.delete("/:id", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), categoryController_1.deleteCategoryController);
exports.default = router;
