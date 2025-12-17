import { prisma } from "../../../infrastructure/prisma/prismaClient";
import slugify from "slugify";

interface CreateProductInput {
  brandId: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl: string;        // obligatoire
  thumbnailUrl?: string; 
  categoryIds?: number[];
}

export async function createProductUsecase(input: CreateProductInput) {
  const slug = slugify(input.name, { lower: true }) + "-" + Date.now();

  const product = await prisma.product.create({
    data: {
      brandId: input.brandId,
      name: input.name,
      slug,
      description: input.description,
      price: input.price,
      stock: input.stock,
      imageUrl: input.imageUrl,
      thumbnailUrl: input.thumbnailUrl ?? null,
      categories: input.categoryIds
        ? { connect: input.categoryIds.map(id => ({ id })) }
        : undefined
    }
  });

  return product;
}
