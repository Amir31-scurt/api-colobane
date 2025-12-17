import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listSellerOrdersUsecase(ownerId: number) {
  return prisma.order.findMany({
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
