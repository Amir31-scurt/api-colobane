import express from "express";
import { authRequired, isSeller } from "../middlewares/authMiddleware";
import { ensureProductOwnership } from "../middlewares/ensureOwnership";
import {
    sellerGetStatsController,
    sellerListProductsController,
    sellerCreateProductController,
    sellerUpdateProductController,
    sellerListOrdersController
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
router.get("/metrics", authRequired, isSeller, sellerGetStatsController);

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
router.get("/products", authRequired, isSeller, sellerListProductsController);
router.post("/products", authRequired, isSeller, sellerCreateProductController);

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
router.patch("/products/:id", authRequired, isSeller, ensureProductOwnership, sellerUpdateProductController);

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
router.get("/orders", authRequired, isSeller, sellerListOrdersController);

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
router.get("/finances", authRequired, isSeller, getSellerFinances);

export default router;
