import { Prisma } from "@prisma/client";
import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminUpdateProductUsecase(
    productId: number,
    data: {
      price?: number;
      stock?: number;
      name?: string;
      description?: string | null;
      imageUrl?: string | null;
    }
  ) {
    const updateData: Prisma.ProductUpdateInput = {
      price: data.price,
      stock: data.stock,
      name: data.name,
      description:
        data.description === null
          ? { set: null }
          : data.description,
          ...(data.imageUrl !== null && data.imageUrl !== undefined && {
            imageUrl: data.imageUrl,
          }),
    };
  
    return prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  }