// src/core/usecases/products/setImagesUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function setImagesUsecase(productId: number, urls: string[]) {
  await prisma.productImage.deleteMany({ where: { productId } });

  const data = urls.map((url, index) => ({
    url,
    position: index,
    productId
  }));

  return prisma.productImage.createMany({ data });
}
