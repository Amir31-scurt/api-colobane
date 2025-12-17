// src/core/usecases/brands/listBrands
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listBrandsUsecase() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });
}
