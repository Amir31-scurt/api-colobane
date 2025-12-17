import express from "express";
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

const router = express.Router();

router.get("/overview", authRequired, isAdmin, getAdminOverviewController);
router.get("/fees", authRequired, isAdmin, getAdminFeesController);
router.get("/sellers", authRequired, isAdmin, getAdminSellersController);
router.get("/orders", authRequired, isAdmin, listAdminOrdersController);
router.get("/orders/export/csv", authRequired, isAdmin, exportOrdersCsvController);
router.put("/sellers/:sellerId/status", authRequired, isAdmin, toggleSellerStatusController);
router.get("/alerts", authRequired, isAdmin, getAdminAlertsController);


export default router;
