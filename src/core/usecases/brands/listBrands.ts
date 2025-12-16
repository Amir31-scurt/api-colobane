// src/core/usecases/brands/listBrands.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function listBrandsUsecase() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });
}
