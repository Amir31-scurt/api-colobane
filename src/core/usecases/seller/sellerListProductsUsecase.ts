import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function sellerListProductsUsecase(
    sellerId: number,
    page: number,
    pageSize: number,
    search?: string,
    status?: string,
    stock?: string,
    categoryId?: number
) {
    const skip = (page - 1) * pageSize;

    const whereCondition: any = {
        brand: {
            ownerId: sellerId,
        },
    };

    if (categoryId) {
        whereCondition.categories = {
            some: { id: categoryId }
        };
    }

    if (search) {
        whereCondition.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (status) {
        whereCondition.isActive = status === "active";
    }

    if (stock === "in_stock") {
        whereCondition.stock = { gt: 0 };
    } else if (stock === "out_of_stock") {
        whereCondition.stock = 0;
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where: whereCondition,
            skip,
            take: pageSize,
            include: {
                brand: true,
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where: whereCondition }),
    ]);

    return {
        items: products,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
