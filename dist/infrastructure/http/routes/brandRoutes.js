"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/brandRoutes.ts
const express_1 = __importDefault(require("express"));
const brandController_1 = require("../controllers/brandController");
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const requireRole_1 = require("../middlewares/auth/requireRole");
const brandCategoryController_1 = require("../controllers/brandCategoryController");
const adminBrandController_1 = require("../controllers/admin/adminBrandController");
const router = express_1.default.Router();
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
router.get("/", brandController_1.listBrandsController);
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
router.get("/:slug", brandController_1.getBrandController);
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
router.post("/", requireAuth_1.requireAuth, brandController_1.createBrandController);
// =====================
// ADMIN APPROVAL ROUTES
// =====================
/**
 * @swagger
 * /api/brands/admin/all:
 *   get:
 *     summary: Liste toutes les marques (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED] }
 *       - in: query
 *         name: q
 *         description: Search by name, slug, or owner name
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste paginée des marques
 */
router.get("/admin/all", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminBrandController_1.listAllBrandsController);
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
router.get("/admin/pending", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminBrandController_1.listPendingBrandsController);
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
router.post("/:brandId/approve", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminBrandController_1.approveBrandController);
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
router.post("/:brandId/reject", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminBrandController_1.rejectBrandController);
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
router.get("/:brandId/categories", brandCategoryController_1.getBrandCategoriesController);
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
router.put("/:brandId/categories", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), brandCategoryController_1.assignCategoriesToBrandController);
exports.default = router;
