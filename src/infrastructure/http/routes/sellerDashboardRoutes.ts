import express from "express";
import { authRequired, isSeller } from "../middlewares/authMiddleware.ts";
import { getSellerDashboardController } from "../controllers/sellerDashboardController.ts";

const router = express.Router();

router.get("/dashboard", authRequired, isSeller, getSellerDashboardController);

export default router;
