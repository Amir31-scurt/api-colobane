// src/core/usecases/products/setImagesUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function setImagesUsecase(productId: number, urls: string[]) {
  await prisma.productImage.deleteMany({ where: { productId } });

  const data = urls.map((url, index) => ({
    url,
    position: index,
    productId
  }));

  return prisma.productImage.createMany({ data });
}
