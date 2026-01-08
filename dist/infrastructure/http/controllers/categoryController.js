"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryController = createCategoryController;
exports.listCategoriesController = listCategoriesController;
exports.getCategoryController = getCategoryController;
exports.updateCategoryController = updateCategoryController;
exports.deleteCategoryController = deleteCategoryController;
const createCategory_1 = require("../../../core/usecases/categories/createCategory");
const listCategories_1 = require("../../../core/usecases/categories/listCategories");
const getCategoryBySlug_1 = require("../../../core/usecases/categories/getCategoryBySlug");
const updateCategory_1 = require("../../../core/usecases/categories/updateCategory");
const deleteCategory_1 = require("../../../core/usecases/categories/deleteCategory");
async function createCategoryController(req, res) {
    try {
        const category = await (0, createCategory_1.createCategoryUsecase)(req.body);
        return res.status(201).json(category);
    }
    catch (err) {
        if (err.message === "CATEGORY_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Cette catégorie existe déjà." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function listCategoriesController(req, res) {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const q = req.query.q || "";
    const result = await (0, listCategories_1.listCategoriesUsecase)({ page, pageSize, search: q });
    return res.json(result);
}
async function getCategoryController(req, res) {
    try {
        const slug = req.params.slug;
        const category = await (0, getCategoryBySlug_1.getCategoryBySlugUsecase)(slug);
        return res.json(category);
    }
    catch (err) {
        if (err.message === "CATEGORY_NOT_FOUND") {
            return res.status(404).json({ message: "Catégorie introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function updateCategoryController(req, res) {
    try {
        const id = Number(req.params.id);
        const category = await (0, updateCategory_1.updateCategoryUsecase)(id, req.body);
        return res.json(category);
    }
    catch (err) {
        if (err.message === "CATEGORY_NOT_FOUND") {
            return res.status(404).json({ message: "Catégorie introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function deleteCategoryController(req, res) {
    try {
        const id = Number(req.params.id);
        await (0, deleteCategory_1.deleteCategoryUsecase)(id);
        return res.json({ message: "Catégorie supprimée avec succès." });
    }
    catch (err) {
        if (err.message === "CATEGORY_NOT_FOUND") {
            return res.status(404).json({ message: "Catégorie introuvable." });
        }
        if (err.message === "CATEGORY_HAS_PRODUCTS") {
            return res.status(400).json({ message: "Impossible de supprimer une catégorie contenant des produits." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
