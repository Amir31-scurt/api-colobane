import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function getProductBySlugUsecase(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { categories: true, brand: true }
  });

  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  return product;
}
