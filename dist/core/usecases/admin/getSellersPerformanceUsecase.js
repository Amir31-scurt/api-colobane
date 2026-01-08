"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellersPerformanceUsecase = getSellersPerformanceUsecase;
exports.toggleSellerStatusUsecase = toggleSellerStatusUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getSellersPerformanceUsecase() {
    const sellers = await prismaClient_1.prisma.user.findMany({
        where: { role: "SELLER" },
        include: {
            brands: {
                include: {
                    products: {
                        include: {
                            orderItems: {
                                include: { order: true }
                            }
                        }
                    }
                }
            }
        }
    });
    return sellers.map((seller) => {
        let revenue = 0;
        let orders = new Set();
        seller.brands.forEach((brand) => {
            brand.products.forEach((product) => {
                product.orderItems.forEach((item) => {
                    revenue += item.unitPrice * item.quantity;
                    orders.add(item.orderId);
                });
            });
        });
        return {
            sellerId: seller.id,
            name: seller.name,
            revenue,
            orders: orders.size
        };
    });
}
async function toggleSellerStatusUsecase(userId, isActive) {
    return prismaClient_1.prisma.user.update({
        where: { id: userId },
        data: { isActive }
    });
}
