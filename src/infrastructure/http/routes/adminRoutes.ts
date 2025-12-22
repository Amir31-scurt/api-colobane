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

export const adminRoutes = Router();
// Public (admin login)
adminRoutes.post("/auth/login", adminLoginController);

// Protected (admin only)
adminRoutes.use(requireAuth, requireRole("ADMIN"));

adminRoutes.post("/auth/logout", adminLogoutController);

adminRoutes.get("/stats", adminStatsController);

// Orders
adminRoutes.get("/orders", adminListOrdersController);
adminRoutes.get("/orders/:id", adminGetOrderController);
adminRoutes.patch("/orders/:id/status", adminUpdateOrderStatusController);

// Products
adminRoutes.get("/products", adminListProductsController);
adminRoutes.patch("/products/:id", adminUpdateProductController);
adminRoutes.patch("/products/:id/active", adminToggleProductActiveController);

// Users
adminRoutes.get("/users", adminListUsersController);
adminRoutes.patch("/users/:id/role", adminUpdateUserRoleController);
adminRoutes.patch("/users/:id/block", adminToggleUserBlockController);


export default router;
