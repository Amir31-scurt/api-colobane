"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotionController = createPromotionController;
exports.listPromotionsController = listPromotionsController;
exports.getPromotionController = getPromotionController;
exports.updatePromotionController = updatePromotionController;
exports.togglePromotionController = togglePromotionController;
exports.assignPromotionToProductsController = assignPromotionToProductsController;
exports.assignPromotionToBrandsController = assignPromotionToBrandsController;
exports.assignPromotionToCategoriesController = assignPromotionToCategoriesController;
const createPromotionUsecase_1 = require("../../../core/usecases/promotions/createPromotionUsecase");
const listPromotionsUsecase_1 = require("../../../core/usecases/promotions/listPromotionsUsecase");
const getPromotionUsecase_1 = require("../../../core/usecases/promotions/getPromotionUsecase");
const updatePromotionUsecase_1 = require("../../../core/usecases/promotions/updatePromotionUsecase");
const togglePromotionUsecase_1 = require("../../../core/usecases/promotions/togglePromotionUsecase");
const assignPromotionToProductsUsecase_1 = require("../../../core/usecases/promotions/assignPromotionToProductsUsecase");
const assignPromotionToBrandsUsecase_1 = require("../../../core/usecases/promotions/assignPromotionToBrandsUsecase");
const assignPromotionToCategoriesUsecase_1 = require("../../../core/usecases/promotions/assignPromotionToCategoriesUsecase");
async function createPromotionController(req, res) {
    try {
        const body = req.body;
        const promo = await (0, createPromotionUsecase_1.createPromotionUsecase)({
            name: body.name,
            description: body.description,
            discountType: body.discountType,
            discountValue: body.discountValue,
            startsAt: new Date(body.startsAt),
            endsAt: new Date(body.endsAt),
            isActive: body.isActive,
            productIds: body.productIds,
            brandIds: body.brandIds,
            categoryIds: body.categoryIds
        });
        return res.status(201).json(promo);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function listPromotionsController(req, res) {
    const promos = await (0, listPromotionsUsecase_1.listPromotionsUsecase)();
    return res.json(promos);
}
async function getPromotionController(req, res) {
    try {
        const id = Number(req.params.promotionId);
        const promo = await (0, getPromotionUsecase_1.getPromotionUsecase)(id);
        return res.json(promo);
    }
    catch (err) {
        if (err.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ message: "Promotion introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function updatePromotionController(req, res) {
    try {
        const id = Number(req.params.promotionId);
        const body = req.body;
        const promo = await (0, updatePromotionUsecase_1.updatePromotionUsecase)(id, {
            name: body.name,
            description: body.description,
            discountType: body.discountType,
            discountValue: body.discountValue,
            startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
            endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
            isActive: body.isActive
        });
        return res.json(promo);
    }
    catch (err) {
        if (err.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ message: "Promotion introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function togglePromotionController(req, res) {
    try {
        const id = Number(req.params.promotionId);
        const { isActive } = req.body;
        const promo = await (0, togglePromotionUsecase_1.togglePromotionUsecase)(id, Boolean(isActive));
        return res.json(promo);
    }
    catch (err) {
        if (err.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ message: "Promotion introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function assignPromotionToProductsController(req, res) {
    try {
        const id = Number(req.params.promotionId);
        const { productIds } = req.body;
        const promo = await (0, assignPromotionToProductsUsecase_1.assignPromotionToProductsUsecase)(id, productIds);
        return res.json(promo);
    }
    catch (err) {
        if (err.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ message: "Promotion introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function assignPromotionToBrandsController(req, res) {
    try {
        const id = Number(req.params.promotionId);
        const { brandIds } = req.body;
        const promo = await (0, assignPromotionToBrandsUsecase_1.assignPromotionToBrandsUsecase)(id, brandIds);
        return res.json(promo);
    }
    catch (err) {
        if (err.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ message: "Promotion introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
async function assignPromotionToCategoriesController(req, res) {
    try {
        const id = Number(req.params.promotionId);
        const { categoryIds } = req.body;
        const promo = await (0, assignPromotionToCategoriesUsecase_1.assignPromotionToCategoriesUsecase)(id, categoryIds);
        return res.json(promo);
    }
    catch (err) {
        if (err.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ message: "Promotion introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
