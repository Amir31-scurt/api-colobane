"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductUsecase = createProductUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const slugify_1 = __importDefault(require("slugify"));
async function createProductUsecase(input) {
    const slug = (0, slugify_1.default)(input.name, { lower: true }) + "-" + Date.now();
    const product = await prismaClient_1.prisma.product.create({
        data: {
            brandId: input.brandId,
            name: input.name,
            slug,
            description: input.description,
            price: input.price,
            stock: input.stock,
            imageUrl: input.imageUrl,
            thumbnailUrl: input.thumbnailUrl ?? null,
            categories: input.categoryIds
                ? { connect: input.categoryIds.map(id => ({ id })) }
                : undefined
        }
    });
    return product;
}
