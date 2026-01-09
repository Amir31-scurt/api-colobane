"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const requireRole_1 = require("../middlewares/auth/requireRole");
const ensureOwnership_1 = require("../middlewares/ensureOwnership");
const sellerDashboardController_1 = require("../controllers/seller/sellerDashboardController");
const sellerFinancesController_1 = require("../controllers/seller/sellerFinancesController");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Seller Dashboard
 *   description: Espace de gestion pour les vendeurs
 */
/**
 * @swagger
 * /api/seller/metrics:
 *   get:
 *     summary: Récupère les statistiques de vente du vendeur
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques financières et ventes
 */
router.get("/metrics", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerGetStatsController);
/**
 * @swagger
 * /api/seller/products:
 *   get:
 *     summary: Liste les produits appartenant au vendeur
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de produits
 *   post:
 *     summary: Crée un nouveau produit pour le vendeur
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock, categoryId, brandId]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock: { type: number }
 *               categoryId: { type: number }
 *               brandId: { type: number }
 *     responses:
 *       201:
 *         description: Produit créé
 */
router.get("/products", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerListProductsController);
router.post("/products", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerCreateProductController);
/**
 * @swagger
 * /api/seller/products/{id}:
 *   patch:
 *     summary: Met à jour un produit du vendeur
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Produit mis à jour
 */
router.patch("/products/:id", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), ensureOwnership_1.ensureProductOwnership, sellerDashboardController_1.sellerUpdateProductController);
router.get("/products/:id", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), ensureOwnership_1.ensureProductOwnership, sellerDashboardController_1.sellerGetProductController);
router.delete("/products/:id", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), ensureOwnership_1.ensureProductOwnership, sellerDashboardController_1.sellerDeleteProductController);
/**
 * @swagger
 * /api/seller/orders:
 *   get:
 *     summary: Liste les commandes reçues par le vendeur
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de commandes
 */
router.get("/orders", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerListOrdersController);
/**
 * @swagger
 * /api/seller/finances:
 *   get:
 *     summary: Détails financiers du vendeur (revenu, balance, historique payout)
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: État financier du vendeur
 */
router.get("/finances", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerFinancesController_1.getSellerFinances);
/**
 * @swagger
 * /api/seller/brand:
 *   patch:
 *     summary: Met à jour les informations de la boutique (marque)
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               primaryColor: { type: string }
 *               secondaryColor: { type: string }
 *     responses:
 *       200:
 *         description: Marque mise à jour
 */
router.patch("/brand", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerUpdateBrandController);
/**
 * @swagger
 * /api/seller/brand:
 *   get:
 *     summary: Récupère les informations de la boutique (marque)
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de la marque
 */
router.get("/brand", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerGetBrandController);
// ==================== PROMOTIONS ====================
/**
 * @swagger
 * /api/seller/promotions:
 *   get:
 *     summary: Liste les promotions du vendeur
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des promotions
 *   post:
 *     summary: Crée une nouvelle promotion
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Promotion créée
 */
router.get("/promotions", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerListPromotionsController);
router.post("/promotions", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerCreatePromotionController);
/**
 * @swagger
 * /api/seller/promotions/{id}:
 *   get:
 *     summary: Récupère une promotion
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Détails de la promotion
 *   put:
 *     summary: Met à jour une promotion
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Promotion mise à jour
 */
router.get("/promotions/:id", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerGetPromotionController);
router.put("/promotions/:id", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerUpdatePromotionController);
/**
 * @swagger
 * /api/seller/promotions/{id}/toggle:
 *   put:
 *     summary: Active/désactive une promotion
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut de la promotion mis à jour
 */
router.put("/promotions/:id/toggle", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerTogglePromotionController);
/**
 * @swagger
 * /api/seller/promotions/{id}/products:
 *   put:
 *     summary: Assigne des produits à une promotion
 *     tags: [Seller Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Produits assignés
 */
router.put("/promotions/:id/products", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), sellerDashboardController_1.sellerAssignPromotionToProductsController);
exports.default = router;
