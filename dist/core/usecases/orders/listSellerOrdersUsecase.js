"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSellerOrdersUsecase = listSellerOrdersUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listSellerOrdersUsecase(ownerId) {
    return prismaClient_1.prisma.order.findMany({
        where: {
            items: {
                some: {
                    product: {
                        brand: { ownerId }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true
                }
            }
        }
    });
}
