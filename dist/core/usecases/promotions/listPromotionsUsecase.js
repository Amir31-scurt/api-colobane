"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPromotionsUsecase = listPromotionsUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listPromotionsUsecase() {
    return prismaClient_1.prisma.promotion.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            products: true,
            brands: true,
            categories: true
        }
    });
}
