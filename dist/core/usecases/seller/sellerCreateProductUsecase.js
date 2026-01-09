"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerCreateProductUsecase = sellerCreateProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const slugify_1 = __importDefault(require("slugify"));
async function sellerCreateProductUsecase(sellerId, data) {
    // 1. Determine Brand
    let targetBrandId = data.brandId;
    if (targetBrandId) {
        const brand = await prismaClient_1.prisma.brand.findUnique({ where: { id: targetBrandId } });
        if (!brand || brand.ownerId !== sellerId) {
            throw new Error("FORBIDDEN_BRAND_ACCESS");
        }
    }
    else {
        const firstBrand = await prismaClient_1.prisma.brand.findFirst({ where: { ownerId: sellerId } });
        if (!firstBrand)
            throw new Error("NO_BRAND_FOUND");
        targetBrandId = firstBrand.id;
    }
    const slug = (0, slugify_1.default)(data.name, { lower: true, strict: true }) + "-" + Date.now();
    const product = await prismaClient_1.prisma.product.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            price: data.price,
            stock: data.stock,
            imageUrl: data.imageUrl,
            thumbnailUrl: data.thumbnailUrl,
            brandId: targetBrandId,
            isActive: true,
            categories: {
                connect: { id: data.categoryId }
            },
            ...(data.variants && data.variants.length > 0 && {
                variants: {
                    create: data.variants.map(v => ({
                        name: v.name,
                        price: v.price ?? null,
                        stock: v.stock,
                        option1: v.option1,
                        option2: v.option2,
                        option3: v.option3,
                        imageUrl: v.imageUrl ?? null,
                        thumbnailUrl: v.thumbnailUrl ?? null
                    }))
                }
            })
        },
    });
    await prismaClient_1.prisma.auditLog.create({
        data: {
            action: "PRODUCT_CREATED",
            actorId: sellerId,
            entityType: "Product",
            entityId: product.id.toString(),
            meta: { name: product.name, price: product.price },
        }
    });
    return product;
}
