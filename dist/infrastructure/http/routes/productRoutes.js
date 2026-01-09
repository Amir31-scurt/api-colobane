"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/productRoutes.ts
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
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
router.get("/", productController_1.listProductsController);
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
router.get("/search", productController_1.searchProductsController);
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
router.get("/:slug", productController_1.getProductController);
// Création produit (SELLER ou ADMIN)
router.post("/", authMiddleware_1.authRequired, authMiddleware_1.isSeller, productController_1.createProductController);
// Update produit
router.put("/:productId", authMiddleware_1.authRequired, authMiddleware_1.isSeller, productController_1.updateProductController);
// Images
router.put("/:productId/images", authMiddleware_1.authRequired, authMiddleware_1.isSeller, productController_1.setImagesController);
// Variants
router.put("/:productId/variants", authMiddleware_1.authRequired, authMiddleware_1.isSeller, productController_1.setVariantsController);
router.get("/search/advanced", productController_1.advancedSearchProductsController);
exports.default = router;
