import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listUserOrdersUsecase(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      },
      deliveryMethod: true,
      deliveryLocation: true,
      Payment: true,
    }
  });
}
