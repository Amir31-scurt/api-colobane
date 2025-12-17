import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export async function updateProductUsecase(slug: string, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  return prisma.product.update({
    where: { slug },
    data: input,
    include: { categories: true }
  });
}
