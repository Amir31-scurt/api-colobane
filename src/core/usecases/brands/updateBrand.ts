import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface UpdateBrandInput {
  brandId: number;
  userId: number; // For authorization check
  name?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  locationId?: number;
}

export async function updateBrandUsecase(input: UpdateBrandInput) {
  const { brandId, userId, ...data } = input;

  // 1. Check if brand exists
  const brand = await prisma.brand.findUnique({
    where: { id: brandId }
  });

  if (!brand) throw new Error("BRAND_NOT_FOUND");

  // 2. Authorization: Only owner can update
  if (brand.ownerId !== userId) {
    // Check if user is admin (optional, for now keep strict ownership)
    // For now assuming only owner updates via this route
    throw new Error("UNAUTHORIZED");
  }

  // 3. Update
  const updatedBrand = await prisma.brand.update({
    where: { id: brandId },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });

  return updatedBrand;
}
