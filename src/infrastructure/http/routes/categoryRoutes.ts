// src/infrastructure/http/routes/categoryRoutes.ts
import express from "express";

import {
  createCategoryController,
  listCategoriesController,
  getCategoryController
} from "../controllers/categoryController.ts";

import { authRequired, isAdmin } from "../middlewares/authMiddleware.ts";

const router = express.Router();

router.get("/", listCategoriesController);
router.get("/:slug", getCategoryController);
router.post("/", authRequired, isAdmin, createCategoryController);

export default router;
