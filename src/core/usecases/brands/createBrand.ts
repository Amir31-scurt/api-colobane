// src/core/usecases/brands/createBrand.ts
import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

interface CreateBrandInput {
  name: string;
  slug: string;
  ownerId: number;      // ← ajouté
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export async function createBrandUsecase(input: CreateBrandInput) {
  const existing = await prisma.brand.findUnique({
    where: { slug: input.slug }
  });

  if (existing) {
    throw new Error("BRAND_ALREADY_EXISTS");
  }

  const brand = await prisma.brand.create({
    data: {
      name: input.name,
      slug: input.slug,
      ownerId: input.ownerId,    // ← propriété obligatoire
      description: input.description,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      logoUrl: input.logoUrl
    }
  });

  return brand;
}
