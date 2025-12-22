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
import { adminLoginController, adminLogoutController } from "../controllers/admin/adminAuthController";
import { requireRole } from "../middlewares/auth/requireRole";
import { requireAuth } from "../middlewares/auth/requireAuth";
import { adminStatsController } from "../controllers/admin/adminStatsController";
import { adminGetOrderController, adminListOrdersController, adminUpdateOrderStatusController } from "../controllers/admin/adminOrdersController";
import { adminListProductsController, adminToggleProductActiveController, adminUpdateProductController } from "../controllers/admin/adminProductsController";
import { adminListUsersController, adminToggleUserBlockController, adminUpdateUserRoleController } from "../controllers/admin/adminUsersController";

const router = express.Router();

router.get("/overview", authRequired, isAdmin, getAdminOverviewController);
router.get("/fees", authRequired, isAdmin, getAdminFeesController);
router.get("/sellers", authRequired, isAdmin, getAdminSellersController);
router.get("/orders", authRequired, isAdmin, listAdminOrdersController);
router.get("/orders/export/csv", authRequired, isAdmin, exportOrdersCsvController);
router.put("/sellers/:sellerId/status", authRequired, isAdmin, toggleSellerStatusController);
router.get("/alerts", authRequired, isAdmin, getAdminAlertsController);
// Public (admin login)
router.post("/auth/login", adminLoginController);

// Protected (admin only)
router.use(requireAuth, requireRole("ADMIN"));

router.post("/auth/logout", adminLogoutController);

router.get("/stats", adminStatsController);

// Orders
router.get("/orders", adminListOrdersController);
router.get("/orders/:id", adminGetOrderController);
router.patch("/orders/:id/status", adminUpdateOrderStatusController);

// Products
router.get("/products", adminListProductsController);
router.patch("/products/:id", adminUpdateProductController);
router.patch("/products/:id/active", adminToggleProductActiveController);

// Users
router.get("/users", adminListUsersController);
router.patch("/users/:id/role", adminUpdateUserRoleController);
router.patch("/users/:id/block", adminToggleUserBlockController);


export default router;
