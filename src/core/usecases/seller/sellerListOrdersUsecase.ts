import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function sellerListOrdersUsecase(sellerId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    // Find brands owned by seller
    const brands = await prisma.brand.findMany({
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

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
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
        prisma.order.count({ where: whereCondition }),
    ]);

    return {
        items: orders,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
