import express from "express";
import { authRequired, isAdmin } from "../middlewares/authMiddleware";
import {
  createPromotionController,
  listPromotionsController,
  getPromotionController,
  updatePromotionController,
  togglePromotionController,
  assignPromotionToProductsController,
  assignPromotionToBrandsController,
  assignPromotionToCategoriesController
} from "../controllers/promotionController";

const router = express.Router();

router.get("/", authRequired, isAdmin, listPromotionsController);
router.post("/", authRequired, isAdmin, createPromotionController);

router.get("/:promotionId", authRequired, isAdmin, getPromotionController);
router.put("/:promotionId", authRequired, isAdmin, updatePromotionController);
router.put("/:promotionId/toggle", authRequired, isAdmin, togglePromotionController);

router.put("/:promotionId/products", authRequired, isAdmin, assignPromotionToProductsController);
router.put("/:promotionId/brands", authRequired, isAdmin, assignPromotionToBrandsController);
router.put("/:promotionId/categories", authRequired, isAdmin, assignPromotionToCategoriesController);

export default router;
