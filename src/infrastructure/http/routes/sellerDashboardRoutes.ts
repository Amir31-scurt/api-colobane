import express from "express";
import { requireAuth } from "../middlewares/auth/requireAuth";
import { requireRole } from "../middlewares/auth/requireRole";
import { ensureProductOwnership } from "../middlewares/ensureOwnership";
import {
    sellerGetStatsController,
    sellerListProductsController,
    sellerCreateProductController,
    sellerUpdateProductController,
    sellerListOrdersController,
    sellerUpdateBrandController,
    sellerGetBrandController
} from "../controllers/seller/sellerDashboardController";
import { getSellerFinances } from "../controllers/seller/sellerFinancesController";

const router = express.Router();

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
router.get("/metrics", requireAuth, requireRole("SELLER", "ADMIN"), sellerGetStatsController);

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
router.get("/products", requireAuth, requireRole("SELLER", "ADMIN"), sellerListProductsController);
router.post("/products", requireAuth, requireRole("SELLER", "ADMIN"), sellerCreateProductController);

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
router.patch("/products/:id", requireAuth, requireRole("SELLER", "ADMIN"), ensureProductOwnership, sellerUpdateProductController);

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
router.get("/orders", requireAuth, requireRole("SELLER", "ADMIN"), sellerListOrdersController);

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
router.get("/finances", requireAuth, requireRole("SELLER", "ADMIN"), getSellerFinances);

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
router.patch("/brand", requireAuth, requireRole("SELLER", "ADMIN"), sellerUpdateBrandController);

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
router.get("/brand", requireAuth, requireRole("SELLER", "ADMIN"), sellerGetBrandController);

export default router;
