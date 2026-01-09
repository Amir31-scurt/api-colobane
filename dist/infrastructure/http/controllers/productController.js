"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductController = createProductController;
exports.updateProductController = updateProductController;
exports.listProductsController = listProductsController;
exports.getProductController = getProductController;
exports.setImagesController = setImagesController;
exports.setVariantsController = setVariantsController;
exports.searchProductsController = searchProductsController;
exports.advancedSearchProductsController = advancedSearchProductsController;
const createProductUsecase_1 = require("../../../core/usecases/products/createProductUsecase");
const updateProductUsecase_1 = require("../../../core/usecases/products/updateProductUsecase");
const listProductsUsecase_1 = require("../../../core/usecases/products/listProductsUsecase");
const getProductUsecase_1 = require("../../../core/usecases/products/getProductUsecase");
const setImagesUsecase_1 = require("../../../core/usecases/products/setImagesUsecase");
const setVariantsUsecase_1 = require("../../../core/usecases/products/setVariantsUsecase");
const searchProductsUsecase_1 = require("../../../core/usecases/products/searchProductsUsecase");
const advancedSearchProductsUsecase_1 = require("../../../core/usecases/products/advancedSearchProductsUsecase");
const productMapper_1 = require("../../../core/appers/productMapper");
const cache_1 = require("../../cache/cache");
async function createProductController(req, res) {
    try {
        const product = await (0, createProductUsecase_1.createProductUsecase)(req.body);
        return res.status(201).json(product);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne lors de la création du produit" });
    }
}
async function updateProductController(req, res) {
    try {
        const id = Number(req.params.productId);
        const updated = await (0, updateProductUsecase_1.updateProductUsecase)(id, req.body);
        return res.json(updated);
    }
    catch (err) {
        if (err.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({ message: "Produit introuvable" });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne lors de la mise à jour" });
    }
}
async function listProductsController(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const search = req.query.search?.toString();
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
        const brandId = req.query.brandId ? Number(req.query.brandId) : undefined;
        console.log("listProductsController query:", req.query);
        console.log("listProductsController parsed search:", search);
        const result = await (0, listProductsUsecase_1.listProductsUsecase)({
            page,
            limit,
            search,
            categoryId,
            brandId
        });
        return res.json(result);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
}
async function getProductController(req, res) {
    try {
        const product = await (0, getProductUsecase_1.getProductUsecase)(req.params.slug);
        return res.json(product);
    }
    catch (err) {
        if (err.message === "PRODUCT_NOT_FOUND") {
            return res.status(404).json({ message: "Produit introuvable" });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne lors de la récupération du produit" });
    }
}
async function setImagesController(req, res) {
    try {
        const id = Number(req.params.productId);
        const urls = req.body.urls;
        await (0, setImagesUsecase_1.setImagesUsecase)(id, urls);
        return res.json({ message: "Images mises à jour" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne update images" });
    }
}
async function setVariantsController(req, res) {
    try {
        const id = Number(req.params.productId);
        const variants = req.body.variants;
        // Chaque variant peut inclure: name, price, stock, option1, option2, imageUrl, thumbnailUrl…
        await (0, setVariantsUsecase_1.setVariantsUsecase)(id, variants);
        return res.json({ message: "Variantes mises à jour avec image support" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne update variants" });
    }
}
async function searchProductsController(req, res) {
    const q = req.query.q?.toString() || "";
    const results = await (0, searchProductsUsecase_1.searchProductsUsecase)(q);
    return res.json(results);
}
async function advancedSearchProductsController(req, res) {
    const query = req.query.q?.toString() || "";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const phone = req.query.phone?.toString();
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const categoryIds = req.query.categoryIds
        ? req.query.categoryIds.toString().split(",").map(Number)
        : undefined;
    const brandIds = req.query.brandIds
        ? req.query.brandIds.toString().split(",").map(Number)
        : undefined;
    const hasPromotion = req.query.hasPromotion === "true";
    const cacheKey = `search:v1:q=${query}|phone=${phone ?? ""}|min=${minPrice ?? ""}|max=${maxPrice ?? ""}|cat=${(categoryIds ?? []).join("-")}|brand=${(brandIds ?? []).join("-")}|promo=${hasPromotion}`;
    const cached = await (0, cache_1.cacheGet)(cacheKey);
    if (cached) {
        return res.json(cached);
    }
    const products = await (0, advancedSearchProductsUsecase_1.advancedSearchProductsUsecase)({
        query,
        phone,
        minPrice,
        maxPrice,
        categoryIds,
        brandIds,
        hasPromotion
    });
    const mapped = products.map((p) => (0, productMapper_1.mapProductWithFinalPrice)(p));
    await (0, cache_1.cacheSet)(cacheKey, mapped, 60); // 60s TTL
    return res.json(mapped);
}
