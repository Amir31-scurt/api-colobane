// src/infrastructure/http/routes/categoryRoutes.ts
import express from "express";

import {
  createCategoryController,
  listCategoriesController,
  getCategoryController
} from "../controllers/categoryController";

import { authRequired, isAdmin } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", listCategoriesController);
router.get("/:slug", getCategoryController);
router.post("/", authRequired, isAdmin, createCategoryController);

export default router;
