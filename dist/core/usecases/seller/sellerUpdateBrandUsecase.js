"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerUpdateBrandUsecase = sellerUpdateBrandUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const slugify_1 = __importDefault(require("slugify"));
async function sellerUpdateBrandUsecase(userId, data) {
    // Check if user has a brand
    const brand = await prismaClient_1.prisma.brand.findFirst({
        where: { ownerId: userId }
    });
    if (!brand) {
        throw new Error("NO_BRAND_FOUND");
    }
    let newSlug = brand.slug;
    // Handle name change and slug update
    if (data.name && data.name !== brand.name) {
        let baseSlug = (0, slugify_1.default)(data.name, { lower: true, strict: true });
        newSlug = baseSlug;
        // Ensure uniqueness
        let counter = 1;
        while (await prismaClient_1.prisma.brand.findUnique({ where: { slug: newSlug } })) {
            newSlug = `${baseSlug}-${counter}`;
            counter++;
        }
    }
    // Update brand
    const updatedBrand = await prismaClient_1.prisma.brand.update({
        where: { id: brand.id },
        data: {
            name: data.name ?? brand.name,
            slug: newSlug,
            description: data.description ?? brand.description,
            primaryColor: data.primaryColor ?? brand.primaryColor,
            secondaryColor: data.secondaryColor ?? brand.secondaryColor,
            logoUrl: data.logoUrl ?? brand.logoUrl,
            bannerUrl: data.bannerUrl ?? brand.bannerUrl,
            website: data.website ?? brand.website,
        }
    });
    return updatedBrand;
}
