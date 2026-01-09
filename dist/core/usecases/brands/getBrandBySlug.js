"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandBySlugUsecase = getBrandBySlugUsecase;
// src/core/usecases/brands/getBrandBySlug
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getBrandBySlugUsecase(slug) {
    const brand = await prismaClient_1.prisma.brand.findUnique({
        where: { slug }
    });
    if (!brand) {
        throw new Error("BRAND_NOT_FOUND");
    }
    return brand;
}
