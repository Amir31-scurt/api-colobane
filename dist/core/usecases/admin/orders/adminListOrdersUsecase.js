"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListOrdersUsecase = adminListOrdersUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminListOrdersUsecase(params) {
    const { page, pageSize, status, q, minAmount, maxAmount, startDate, endDate } = params;
    const skip = (page - 1) * pageSize;
    const where = {};
    if (status)
        where.status = status;
    if (minAmount || maxAmount) {
        where.totalAmount = {};
        if (minAmount)
            where.totalAmount.gte = minAmount;
        if (maxAmount)
            where.totalAmount.lte = maxAmount;
    }
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate)
            where.createdAt.gte = new Date(startDate);
        if (endDate)
            where.createdAt.lte = new Date(endDate);
    }
    if (q) {
        const qNum = Number(q);
        where.OR = [
            ...(Number.isFinite(qNum) ? [{ id: qNum }] : []),
            {
                user: {
                    OR: [
                        { email: { contains: q, mode: "insensitive" } },
                        { phone: { contains: q, mode: "insensitive" } },
                        { name: { contains: q, mode: "insensitive" } },
                    ],
                },
            },
            // Recherche dans la zone de livraison ou adresse
            { shippingAddress: { contains: q, mode: "insensitive" } },
        ];
    }
    const [total, items] = await Promise.all([
        prismaClient_1.prisma.order.count({ where }),
        prismaClient_1.prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
            select: {
                id: true,
                status: true,
                totalAmount: true,
                paidAt: true,
                deliveryFee: true,
                createdAt: true,
                shippingAddress: true,
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
                // Relation s'appelle "Payment" (capital P) dans ton schema
                Payment: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { status: true, provider: true, amount: true, currency: true, createdAt: true },
                },
            },
        }),
    ]);
    return { total, page, pageSize, items };
}
