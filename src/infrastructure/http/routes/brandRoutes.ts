// src/infrastructure/http/routes/brandRoutes.ts
import express from "express";
import { createBrandController, listBrandsController, getBrandController } 
  from "../controllers/brandController.ts";

import { authRequired, isAdmin } from "../middlewares/authMiddleware.ts";
import {
  assignCategoriesToBrandController,
  getBrandCategoriesController
} from "../controllers/brandCategoryController.ts";

const router = express.Router();

// Liste des marques
router.get("/", listBrandsController);

// Une marque par slug
router.get("/:slug", getBrandController);

// Créer une marque (ADMIN)
router.post("/", authRequired, isAdmin, createBrandController);

router.get("/:brandId/categories", getBrandCategoriesController);
router.put("/:brandId/categories", authRequired, isAdmin, assignCategoriesToBrandController);

export default router;
