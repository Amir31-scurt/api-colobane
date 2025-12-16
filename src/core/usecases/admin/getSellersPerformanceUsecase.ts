import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function getSellersPerformanceUsecase() {
  const sellers = await prisma.user.findMany({
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
    let orders = new Set<number>();

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

export async function toggleSellerStatusUsecase(userId: number, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });
  }
  