// src/core/usecases/products/updateProductUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl: string;
  thumbnailUrl?: string; 
  categoryIds?: number[];
}

export async function updateProductUsecase(id: number, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: input.name ?? product.name,
      description: input.description ?? product.description,
      price: input.price ?? product.price,
      stock: input.stock ?? product.stock,
      imageUrl: input.imageUrl ?? product.imageUrl,
      thumbnailUrl: input.thumbnailUrl ?? product.thumbnailUrl,
      categories: input.categoryIds
        ? {
            set: [],
            connect: input.categoryIds.map((id) => ({ id }))
          }
        : undefined
    }
  });

  return updated;
}
