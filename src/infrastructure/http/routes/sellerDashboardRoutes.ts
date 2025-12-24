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

const router = express.Router();

router.get("/metrics", authRequired, isSeller, sellerGetStatsController);

// Products
router.get("/products", authRequired, isSeller, sellerListProductsController);
router.post("/products", authRequired, isSeller, sellerCreateProductController);
router.patch("/products/:id", authRequired, isSeller, ensureProductOwnership, sellerUpdateProductController);

// Orders
router.get("/orders", authRequired, isSeller, sellerListOrdersController);

// Finances
import { getSellerFinances } from "../controllers/seller/sellerFinancesController";
router.get("/finances", authRequired, isSeller, getSellerFinances);

export default router;
