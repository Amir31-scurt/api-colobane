import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function assignCategoriesToProductUsecase(productSlug: string, categoryIds: number[]) {
  const product = await prisma.product.findUnique({
    where: { slug: productSlug }
  });

  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  return prisma.product.update({
    where: { slug: productSlug },
    data: {
      categories: {
        set: [], // reset les anciennes catégories
        connect: categoryIds.map((id) => ({ id }))
      }
    },
    include: { categories: true }
  });
}
