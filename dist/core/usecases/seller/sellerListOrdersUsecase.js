"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellerListOrdersUsecase = sellerListOrdersUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function sellerListOrdersUsecase(sellerId, page, pageSize, status, search) {
    const skip = (page - 1) * pageSize;
    // Find brands owned by seller
    const brands = await prismaClient_1.prisma.brand.findMany({
        where: { ownerId: sellerId },
        select: { id: true }
    });
    const brandIds = brands.map(b => b.id);
    if (brandIds.length === 0) {
        return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }
    const whereCondition = {
        items: {
            some: {
                product: {
                    brandId: { in: brandIds }
                }
            }
        }
    };
    if (status) {
        whereCondition.status = status;
    }
    if (search) {
        const searchConditions = [
            { user: { name: { contains: search, mode: "insensitive" } } }
        ];
        // If search is a number, try to match ID
        if (!isNaN(Number(search))) {
            searchConditions.push({ id: Number(search) });
        }
        whereCondition.AND = [
            ...(whereCondition.AND || []),
            { OR: searchConditions }
        ];
    }
    const [orders, total] = await Promise.all([
        prismaClient_1.prisma.order.findMany({
            where: whereCondition,
            skip,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true } },
                items: {
                    where: {
                        product: {
                            brandId: { in: brandIds }
                        }
                    },
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        }),
        prismaClient_1.prisma.order.count({ where: whereCondition }),
    ]);
    return {
        items: orders,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
