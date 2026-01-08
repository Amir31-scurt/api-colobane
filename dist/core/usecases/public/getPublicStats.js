"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicStats = getPublicStats;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getPublicStats() {
    const [activeProducts, activeBrands, happyCustomers] = await Promise.all([
        prismaClient_1.prisma.product.count({ where: { isActive: true } }),
        prismaClient_1.prisma.brand.count({ where: { isActive: true } }),
        prismaClient_1.prisma.user.count({ where: { role: 'CUSTOMER' } }), // Assuming standard users are customers
    ]);
    return {
        activeProducts,
        activeBrands,
        happyCustomers
    };
}
