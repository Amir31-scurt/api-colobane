import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface CreateProductInput {
  brandId: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock?: number;
  categoryIds?: number[];
}

export async function createProductUsecase(input: CreateProductInput) {
  const exists = await prisma.product.findUnique({
    where: { slug: input.slug }
  });

  if (exists) throw new Error("PRODUCT_ALREADY_EXISTS");

  const product = await prisma.product.create({
    data: {
      brandId: input.brandId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      price: input.price,
      stock: input.stock ?? 0,
      categories: input.categoryIds
        ? {
            connect: input.categoryIds.map((id) => ({ id }))
          }
        : undefined
    },
    include: {
      categories: true
    }
  });

  return product;
}
