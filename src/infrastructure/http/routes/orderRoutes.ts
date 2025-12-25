import express from "express";
import { authRequired, isSeller, isAdmin } from "../middlewares/authMiddleware";
import {
  createOrderController,
  listUserOrdersController,
  listSellerOrdersController,
  updateOrderStatusController,
  getOrderTrackingController
} from "../controllers/orderController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestion des commandes clients et vendeurs
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, paymentProvider, items]
 *             properties:
 *               shippingAddress: { type: string }
 *               paymentProvider: { type: string, enum: [WAVE, ORANGE_MONEY, CASH] }
 *               items: 
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: number }
 *                     quantity: { type: number }
 *                     variantId: { type: number }
 *     responses:
 *       201:
 *         description: Commande créée
 */
router.post("/", authRequired, createOrderController);

/**
 * @swagger
 * /api/orders/mine:
 *   get:
 *     summary: Liste les commandes de l'utilisateur connecté
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes client
 */
router.get("/mine", authRequired, listUserOrdersController);

/**
 * @swagger
 * /api/orders/seller:
 *   get:
 *     summary: Liste les commandes pour un vendeur
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes contenant les produits du vendeur
 */
router.get("/seller", authRequired, isSeller, listSellerOrdersController);

/**
 * @swagger
 * /api/orders/{orderId}/tracking:
 *   get:
 *     summary: Récupère les informations de tracking d'une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Historique de tracking
 */
router.get("/:orderId/tracking", authRequired, getOrderTrackingController);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Met à jour le statut d'une commande
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [PAID, PROCESSING, SHIPPED, COMPLETED, DELIVERED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.put("/:orderId/status", authRequired, isSeller, updateOrderStatusController);

export default router;
