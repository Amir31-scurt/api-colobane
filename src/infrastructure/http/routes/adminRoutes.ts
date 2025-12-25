import express, { Router } from "express";
import { authRequired, isAdmin } from "../middlewares/authMiddleware";
import {
  getAdminOverviewController,
  getAdminFeesController,
  getAdminSellersController,
  listAdminOrdersController,
  exportOrdersCsvController,
  toggleSellerStatusController,
  getAdminAlertsController
} from "../controllers/adminController";
import { adminLoginController, adminLogoutController, getAdminMeController } from "../controllers/admin/adminAuthController";
import { requireRole } from "../middlewares/auth/requireRole";
import { requireAuth } from "../middlewares/auth/requireAuth";
import {
  adminStatsController,
  adminGetTimeSeriesStatsController,
  adminGetKPIsController,
} from "../controllers/admin/adminStatsController";
import { adminGetOrderController, adminListOrdersController, adminUpdateOrderStatusController } from "../controllers/admin/adminOrdersController";
import { adminListProductsController, adminToggleProductActiveController, adminUpdateProductController } from "../controllers/admin/adminProductsController";
import { adminListUsersController, adminToggleUserBlockController, adminUpdateUserRoleController } from "../controllers/admin/adminUsersController";

const router = express.Router();

// Basic overview stats (legacy)
router.get("/overview", requireAuth, requireRole("ADMIN"), getAdminOverviewController);
router.get("/fees", requireAuth, requireRole("ADMIN"), getAdminFeesController);
router.get("/sellers", requireAuth, requireRole("ADMIN"), getAdminSellersController);
// router.get("/orders", requireAuth, requireRole("ADMIN"), listAdminOrdersController);
router.get("/orders/export/csv", requireAuth, requireRole("ADMIN"), exportOrdersCsvController);
router.put("/sellers/:sellerId/status", requireAuth, requireRole("ADMIN"), toggleSellerStatusController);
router.get("/alerts", requireAuth, requireRole("ADMIN"), getAdminAlertsController);
// Public (admin login)
router.post("/auth/login", adminLoginController);

// Protected (admin & seller)
router.use(requireAuth, requireRole("ADMIN", "SELLER"));

router.get("/auth/me", getAdminMeController);
router.post("/auth/logout", adminLogoutController);

router.get("/stats", adminStatsController);
router.get("/stats/timeseries", adminGetTimeSeriesStatsController);
router.get("/stats/kpis", adminGetKPIsController);

// Orders
router.get("/orders", adminListOrdersController);
router.get("/orders/:id", adminGetOrderController);
router.patch("/orders/:id/status", requireRole("ADMIN"), adminUpdateOrderStatusController);

// Products
router.get("/products", adminListProductsController);
// Write actions restricted to ADMIN
router.patch("/products/:id", requireRole("ADMIN"), adminUpdateProductController);
router.patch("/products/:id/active", requireRole("ADMIN"), adminToggleProductActiveController);

// Users
router.get("/users", adminListUsersController);
// Write actions restricted to ADMIN
router.patch("/users/:id/role", requireRole("ADMIN"), adminUpdateUserRoleController);
router.patch("/users/:id/block", requireRole("ADMIN"), adminToggleUserBlockController);

// Delivery Zones
import { adminCreateDeliveryZoneController, adminListDeliveryZonesController } from "../controllers/admin/adminDeliveryController";
router.post("/delivery/zones", requireRole("ADMIN"), adminCreateDeliveryZoneController);
router.get("/delivery/zones", requireRole("ADMIN"), adminListDeliveryZonesController);

/**
 * @swagger
 * tags:
 *   name: Admin / Finances
 *   description: Gestion financière (commissions, reversements, exports)
 */

// Finances
import { listSellersFinances, createPayout, exportFinancesCsv } from "../controllers/admin/adminFinancesController";

/**
 * @swagger
 * /admin/finances/sellers:
 *   get:
 *     summary: Liste les finances de tous les vendeurs
 *     tags: [Admin / Finances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 */
router.get("/finances/sellers", requireRole("ADMIN"), listSellersFinances);

/**
 * @swagger
 * /admin/finances/payouts:
 *   post:
 *     summary: Enregistre un nouveau reversement pour un vendeur
 *     tags: [Admin / Finances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sellerId:
 *                 type: number
 *               amount:
 *                 type: number
 *               provider:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reversement créé
 */
router.post("/finances/payouts", requireRole("ADMIN"), createPayout);

/**
 * @swagger
 * /admin/finances/export:
 *   get:
 *     summary: Exportation des données financières en CSV
 *     tags: [Admin / Finances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sales, payments, commissions]
 *         required: true
 *     responses:
 *       200:
 *         description: Fichier CSV
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get("/finances/export", requireRole("ADMIN"), exportFinancesCsv);

export default router;
