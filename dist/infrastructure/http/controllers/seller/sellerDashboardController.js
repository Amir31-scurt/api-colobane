"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerGetStatsController = sellerGetStatsController;
exports.sellerListProductsController = sellerListProductsController;
exports.sellerCreateProductController = sellerCreateProductController;
exports.sellerUpdateProductController = sellerUpdateProductController;
exports.sellerListOrdersController = sellerListOrdersController;
exports.sellerUpdateBrandController = sellerUpdateBrandController;
exports.sellerGetBrandController = sellerGetBrandController;
exports.sellerGetProductController = sellerGetProductController;
exports.sellerDeleteProductController = sellerDeleteProductController;
exports.sellerCreatePromotionController = sellerCreatePromotionController;
exports.sellerListPromotionsController = sellerListPromotionsController;
exports.sellerGetPromotionController = sellerGetPromotionController;
exports.sellerUpdatePromotionController = sellerUpdatePromotionController;
exports.sellerTogglePromotionController = sellerTogglePromotionController;
exports.sellerAssignPromotionToProductsController = sellerAssignPromotionToProductsController;
const sellerGetStatsUsecase_1 = require("../../../../core/usecases/seller/sellerGetStatsUsecase");
const sellerListProductsUsecase_1 = require("../../../../core/usecases/seller/sellerListProductsUsecase");
const sellerCreateProductUsecase_1 = require("../../../../core/usecases/seller/sellerCreateProductUsecase");
const sellerUpdateProductUsecase_1 = require("../../../../core/usecases/seller/sellerUpdateProductUsecase");
const sellerListOrdersUsecase_1 = require("../../../../core/usecases/seller/sellerListOrdersUsecase");
const sellerUpdateBrandUsecase_1 = require("../../../../core/usecases/seller/sellerUpdateBrandUsecase");
const sellerGetBrandUsecase_1 = require("../../../../core/usecases/seller/sellerGetBrandUsecase");
const sellerGetProductUsecase_1 = require("../../../../core/usecases/seller/sellerGetProductUsecase");
const sellerDeleteProductUsecase_1 = require("../../../../core/usecases/seller/sellerDeleteProductUsecase");
const createPromotionUsecase_1 = require("../../../../core/usecases/promotions/createPromotionUsecase");
const updatePromotionUsecase_1 = require("../../../../core/usecases/promotions/updatePromotionUsecase");
const togglePromotionUsecase_1 = require("../../../../core/usecases/promotions/togglePromotionUsecase");
const assignPromotionToProductsUsecase_1 = require("../../../../core/usecases/promotions/assignPromotionToProductsUsecase");
const prismaClient_1 = require("../../../prisma/prismaClient");
async function sellerGetStatsController(req, res) {
    try {
        const userId = req.auth.userId;
        const stats = await (0, sellerGetStatsUsecase_1.sellerGetStatsUsecase)(userId);
        return res.json(stats);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerListProductsController(req, res) {
    try {
        const userId = req.auth.userId;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.q;
        const status = req.query.status;
        const stock = req.query.stock;
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
        const result = await (0, sellerListProductsUsecase_1.sellerListProductsUsecase)(userId, page, pageSize, search, status, stock, categoryId);
        return res.json(result);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerCreateProductController(req, res) {
    try {
        const userId = req.auth.userId;
        const body = req.body;
        const product = await (0, sellerCreateProductUsecase_1.sellerCreateProductUsecase)(userId, body);
        return res.status(201).json(product);
    }
    catch (e) {
        console.error(e);
        if (e.message === "FORBIDDEN_BRAND_ACCESS")
            return res.status(403).json({ error: "FORBIDDEN" });
        if (e.message === "NO_BRAND_FOUND")
            return res.status(400).json({ error: "NO_BRAND" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerUpdateProductController(req, res) {
    try {
        const userId = req.auth.userId;
        const productId = Number(req.params.id);
        const body = req.body;
        const product = await (0, sellerUpdateProductUsecase_1.sellerUpdateProductUsecase)(userId, productId, body);
        return res.json(product);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerListOrdersController(req, res) {
    try {
        const userId = req.auth.userId;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const status = req.query.status;
        const search = req.query.q;
        const result = await (0, sellerListOrdersUsecase_1.sellerListOrdersUsecase)(userId, page, pageSize, status, search);
        return res.json(result);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerUpdateBrandController(req, res) {
    try {
        const userId = req.auth.userId;
        const body = req.body;
        const brand = await (0, sellerUpdateBrandUsecase_1.sellerUpdateBrandUsecase)(userId, body);
        return res.json(brand);
    }
    catch (e) {
        console.error(e);
        if (e.message === "NO_BRAND_FOUND")
            return res.status(404).json({ error: "NO_BRAND" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerGetBrandController(req, res) {
    try {
        const userId = req.auth.userId;
        const brand = await (0, sellerGetBrandUsecase_1.sellerGetBrandUsecase)(userId);
        if (!brand)
            return res.status(404).json({ error: "NO_BRAND" });
        return res.json(brand);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerGetProductController(req, res) {
    try {
        const userId = req.auth.userId;
        const productId = Number(req.params.id);
        const product = await (0, sellerGetProductUsecase_1.sellerGetProductUsecase)(userId, productId);
        return res.json(product);
    }
    catch (e) {
        console.error(e);
        if (e.message === "PRODUCT_NOT_FOUND")
            return res.status(404).json({ error: "NOT_FOUND" });
        if (e.message === "FORBIDDEN")
            return res.status(403).json({ error: "FORBIDDEN" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerDeleteProductController(req, res) {
    try {
        const userId = req.auth.userId;
        const productId = Number(req.params.id);
        await (0, sellerDeleteProductUsecase_1.sellerDeleteProductUsecase)(userId, productId);
        return res.status(204).send();
    }
    catch (e) {
        console.error(e);
        if (e.message === "PRODUCT_NOT_FOUND")
            return res.status(404).json({ error: "NOT_FOUND" });
        if (e.message === "FORBIDDEN")
            return res.status(403).json({ error: "FORBIDDEN" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
// ==================== PROMOTIONS ====================
async function sellerCreatePromotionController(req, res) {
    try {
        const userId = req.auth.userId;
        const body = req.body;
        // Get seller's brand
        const brand = await prismaClient_1.prisma.brand.findFirst({ where: { ownerId: userId } });
        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }
        // Create promotion restricted to seller's brand
        const promotion = await (0, createPromotionUsecase_1.createPromotionUsecase)({
            name: body.name,
            description: body.description,
            discountType: body.discountType,
            discountValue: body.discountValue,
            startsAt: new Date(body.startsAt),
            endsAt: new Date(body.endsAt),
            isActive: body.isActive ?? true,
            productIds: body.productIds || [],
            brandIds: [brand.id], // Restrict to seller's brand only
            categoryIds: body.categoryIds || []
        });
        return res.status(201).json(promotion);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerListPromotionsController(req, res) {
    try {
        const userId = req.auth.userId;
        // Get seller's brand
        const brand = await prismaClient_1.prisma.brand.findFirst({ where: { ownerId: userId } });
        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }
        // Get only promotions for this seller's brand
        const promotions = await prismaClient_1.prisma.promotion.findMany({
            where: {
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        thumbnailUrl: true
                    }
                },
                brands: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                categories: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json(promotions);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerGetPromotionController(req, res) {
    try {
        const userId = req.auth.userId;
        const promotionId = Number(req.params.id);
        // Get seller's brand
        const brand = await prismaClient_1.prisma.brand.findFirst({ where: { ownerId: userId } });
        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }
        // Get promotion and verify ownership
        const promotion = await prismaClient_1.prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            },
            include: {
                products: true,
                brands: true,
                categories: true
            }
        });
        if (!promotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        return res.json(promotion);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerUpdatePromotionController(req, res) {
    try {
        const userId = req.auth.userId;
        const promotionId = Number(req.params.id);
        const body = req.body;
        // Get seller's brand
        const brand = await prismaClient_1.prisma.brand.findFirst({ where: { ownerId: userId } });
        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }
        // Verify ownership
        const existingPromotion = await prismaClient_1.prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            }
        });
        if (!existingPromotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        // Update promotion
        const promotion = await (0, updatePromotionUsecase_1.updatePromotionUsecase)(promotionId, {
            name: body.name,
            description: body.description,
            discountType: body.discountType,
            discountValue: body.discountValue,
            startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
            endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
            isActive: body.isActive
        });
        return res.json(promotion);
    }
    catch (e) {
        console.error(e);
        if (e.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerTogglePromotionController(req, res) {
    try {
        const userId = req.auth.userId;
        const promotionId = Number(req.params.id);
        const { isActive } = req.body;
        // Get seller's brand
        const brand = await prismaClient_1.prisma.brand.findFirst({ where: { ownerId: userId } });
        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }
        // Verify ownership
        const existingPromotion = await prismaClient_1.prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            }
        });
        if (!existingPromotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        // Toggle promotion
        const promotion = await (0, togglePromotionUsecase_1.togglePromotionUsecase)(promotionId, Boolean(isActive));
        return res.json(promotion);
    }
    catch (e) {
        console.error(e);
        if (e.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function sellerAssignPromotionToProductsController(req, res) {
    try {
        const userId = req.auth.userId;
        const promotionId = Number(req.params.id);
        const { productIds } = req.body;
        // Get seller's brand
        const brand = await prismaClient_1.prisma.brand.findFirst({ where: { ownerId: userId } });
        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }
        // Verify promotion ownership
        const existingPromotion = await prismaClient_1.prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            }
        });
        if (!existingPromotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        // Verify all products belong to seller
        const products = await prismaClient_1.prisma.product.findMany({
            where: {
                id: { in: productIds },
                brandId: brand.id
            }
        });
        if (products.length !== productIds.length) {
            return res.status(403).json({ error: "FORBIDDEN - Some products don't belong to you" });
        }
        // Assign products to promotion
        const promotion = await (0, assignPromotionToProductsUsecase_1.assignPromotionToProductsUsecase)(promotionId, productIds);
        return res.json(promotion);
    }
    catch (e) {
        console.error(e);
        if (e.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
