"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCategoriesToBrandController = assignCategoriesToBrandController;
exports.getBrandCategoriesController = getBrandCategoriesController;
const assignCategoriesToBrand_1 = require("../../../core/usecases/brands/assignCategoriesToBrand");
const getBrandCategories_1 = require("../../../core/usecases/brands/getBrandCategories");
async function assignCategoriesToBrandController(req, res) {
    try {
        const brandId = Number(req.params.brandId);
        const { categoryIds } = req.body;
        const categories = await (0, assignCategoriesToBrand_1.assignCategoriesToBrandUsecase)(brandId, categoryIds);
        return res.json(categories);
    }
    catch (err) {
        if (err.message === "BRAND_NOT_FOUND")
            return res.status(404).json({ message: "Marque introuvable." });
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function getBrandCategoriesController(req, res) {
    try {
        const brandId = Number(req.params.brandId);
        const categories = await (0, getBrandCategories_1.getBrandCategoriesUsecase)(brandId);
        return res.json(categories);
    }
    catch (err) {
        if (err.message === "BRAND_NOT_FOUND")
            return res.status(404).json({ message: "Marque introuvable." });
        return res.status(500).json({ message: "Erreur interne." });
    }
}
