"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdminOrdersUsecase = listAdminOrdersUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function listAdminOrdersUsecase(filters) {
    return prismaClient_1.prisma.order.findMany({
        where: {
            AND: [
                filters.status ? { status: filters.status } : {},
                filters.from ? { createdAt: { gte: filters.from } } : {},
                filters.to ? { createdAt: { lte: filters.to } } : {},
                filters.phone
                    ? {
                        user: {
                            phone: { contains: filters.phone }
                        }
                    }
                    : {},
                filters.paymentProvider
                    ? {
                        Payment: {
                            some: { provider: filters.paymentProvider }
                        }
                    }
                    : {},
                filters.onlyCashPending
                    ? {
                        Payment: {
                            some: {
                                provider: "CASH",
                                status: "WAITING_CONFIRMATION"
                            }
                        }
                    }
                    : {}
            ]
        },
        include: {
            user: true,
            Payment: true,
            deliveryAssignments: {
                include: {
                    deliverer: { include: { user: true } }
                }
            },
            items: {
                include: {
                    product: true,
                    variant: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}
