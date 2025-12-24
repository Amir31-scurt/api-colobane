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

router.get("/overview", authRequired, isAdmin, getAdminOverviewController);
router.get("/fees", authRequired, isAdmin, getAdminFeesController);
router.get("/sellers", authRequired, isAdmin, getAdminSellersController);
// router.get("/orders", authRequired, isAdmin, listAdminOrdersController);
router.get("/orders/export/csv", authRequired, isAdmin, exportOrdersCsvController);
router.put("/sellers/:sellerId/status", authRequired, isAdmin, toggleSellerStatusController);
router.get("/alerts", authRequired, isAdmin, getAdminAlertsController);
// Public (admin login)
router.post("/auth/login", adminLoginController);

// Protected (admin & seller)
router.use(requireAuth, requireRole("ADMIN", "SELLER"));

router.get("/auth/me", getAdminMeController);
router.post("/auth/logout", adminLogoutController);

router.get("/admin/stats", adminStatsController);
router.get("/admin/stats/timeseries", adminGetTimeSeriesStatsController);
router.get("/admin/stats/kpis", adminGetKPIsController);

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


export default router;
