"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrandUsecase = createBrandUsecase;
// src/core/usecases/brands/createBrand
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function createBrandUsecase(input) {
    const existing = await prismaClient_1.prisma.brand.findUnique({
        where: { slug: input.slug }
    });
    if (existing) {
        throw new Error("BRAND_ALREADY_EXISTS");
    }
    const brand = await prismaClient_1.prisma.brand.create({
        data: {
            name: input.name,
            slug: input.slug,
            ownerId: input.ownerId, // ← propriété obligatoire
            description: input.description,
            primaryColor: input.primaryColor,
            secondaryColor: input.secondaryColor,
            logoUrl: input.logoUrl
        }
    });
    return brand;
}
