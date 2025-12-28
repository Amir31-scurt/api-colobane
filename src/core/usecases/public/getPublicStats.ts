import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function getPublicStats() {
    const [activeProducts, activeBrands, happyCustomers] = await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.brand.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: 'CUSTOMER' } }), // Assuming standard users are customers
    ]);

    return {
        activeProducts,
        activeBrands,
        happyCustomers
    };
}
