// src/core/usecases/products/setVariantsUsecase.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

interface VariantInput {
  name: string;
  price?: number;
  stock: number;
  option1?: string;
  option2?: string;
  option3?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export async function setVariantsUsecase(productId: number, variants: VariantInput[]) {
  if (!variants || variants.length === 0) {
    throw new Error("AT_LEAST_ONE_VARIANT_REQUIRED");
  }

  variants.forEach(v => {
    if (v.stock === undefined || v.stock === null) {
      throw new Error("VARIANT_STOCK_REQUIRED");
    }
  });
  // On remplace toutes les variantes pour simplifier la gestion
  await prisma.productVariant.deleteMany({ where: { productId } });

  const data = variants.map((v) => ({
    productId,
    name: v.name,
    price: v.price ?? null,
    stock: v.stock,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    imageUrl: v.imageUrl ?? null,
    thumbnailUrl: v.thumbnailUrl ?? null
  }));

  return prisma.productVariant.createMany({ data });
}
