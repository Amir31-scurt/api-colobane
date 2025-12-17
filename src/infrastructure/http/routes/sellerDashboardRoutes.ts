import express from "express";
import { authRequired, isSeller } from "../middlewares/authMiddleware";
import { getSellerDashboardController } from "../controllers/sellerDashboardController";

const router = express.Router();

router.get("/dashboard", authRequired, isSeller, getSellerDashboardController);

export default router;
