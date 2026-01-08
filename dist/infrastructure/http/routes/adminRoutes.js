"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const adminAuthController_1 = require("../controllers/admin/adminAuthController");
const requireRole_1 = require("../middlewares/auth/requireRole");
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const adminStatsController_1 = require("../controllers/admin/adminStatsController");
const adminOrdersController_1 = require("../controllers/admin/adminOrdersController");
const adminProductsController_1 = require("../controllers/admin/adminProductsController");
const adminUsersController_1 = require("../controllers/admin/adminUsersController");
const router = express_1.default.Router();
// Basic overview stats (legacy)
router.get("/overview", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminController_1.getAdminOverviewController);
router.get("/fees", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminController_1.getAdminFeesController);
router.get("/sellers", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminController_1.getAdminSellersController);
// router.get("/orders", requireAuth, requireRole("ADMIN"), listAdminOrdersController);
router.get("/orders/export/csv", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminController_1.exportOrdersCsvController);
router.put("/sellers/:sellerId/status", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminController_1.toggleSellerStatusController);
router.get("/alerts", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN"), adminController_1.getAdminAlertsController);
// Public (admin login)
router.post("/auth/login", adminAuthController_1.adminLoginController);
// Protected (admin & seller)
router.use(requireAuth_1.requireAuth, (0, requireRole_1.requireRole)("ADMIN", "SELLER"));
const authController_1 = require("../controllers/authController");
router.get("/auth/me", adminAuthController_1.getAdminMeController);
router.patch("/auth/me", authController_1.updateProfileController);
router.post("/auth/logout", adminAuthController_1.adminLogoutController);
router.get("/stats", adminStatsController_1.adminStatsController);
router.get("/stats/timeseries", adminStatsController_1.adminGetTimeSeriesStatsController);
router.get("/stats/kpis", adminStatsController_1.adminGetKPIsController);
// Orders
router.get("/orders", adminOrdersController_1.adminListOrdersController);
router.get("/orders/:id", adminOrdersController_1.adminGetOrderController);
router.patch("/orders/:id/status", (0, requireRole_1.requireRole)("ADMIN"), adminOrdersController_1.adminUpdateOrderStatusController);
// Products
router.get("/products", adminProductsController_1.adminListProductsController);
// Write actions restricted to ADMIN
router.patch("/products/:id", (0, requireRole_1.requireRole)("ADMIN"), adminProductsController_1.adminUpdateProductController);
router.patch("/products/:id/active", (0, requireRole_1.requireRole)("ADMIN"), adminProductsController_1.adminToggleProductActiveController);
// Users
router.get("/users", adminUsersController_1.adminListUsersController);
// Write actions restricted to ADMIN
router.patch("/users/:id/role", (0, requireRole_1.requireRole)("ADMIN"), adminUsersController_1.adminUpdateUserRoleController);
router.patch("/users/:id/block", (0, requireRole_1.requireRole)("ADMIN"), adminUsersController_1.adminToggleUserBlockController);
// Delivery Zones
const adminDeliveryController_1 = require("../controllers/admin/adminDeliveryController");
router.post("/delivery/zones", (0, requireRole_1.requireRole)("ADMIN"), adminDeliveryController_1.adminCreateDeliveryZoneController);
router.get("/delivery/zones", (0, requireRole_1.requireRole)("ADMIN"), adminDeliveryController_1.adminListDeliveryZonesController);
/**
 * @swagger
 * tags:
 *   name: Admin / Finances
 *   description: Gestion financière (commissions, reversements, exports)
 */
// Finances
const adminFinancesController_1 = require("../controllers/admin/adminFinancesController");
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
router.get("/finances/sellers", (0, requireRole_1.requireRole)("ADMIN"), adminFinancesController_1.listSellersFinances);
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
router.post("/finances/payouts", (0, requireRole_1.requireRole)("ADMIN"), adminFinancesController_1.createPayout);
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
router.get("/finances/export", (0, requireRole_1.requireRole)("ADMIN"), adminFinancesController_1.exportFinancesCsv);
exports.default = router;
