// src/core/usecases/services/admin/verifyProvider.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { VerificationLevel } from "@prisma/client";

interface VerifyProviderInput {
  providerId: number;
  verificationLevel: VerificationLevel;
  isVerified: boolean;
}

export async function verifyProviderUsecase(input: VerifyProviderInput) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: input.providerId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  return prisma.serviceProvider.update({
    where: { id: input.providerId },
    data: {
      verificationLevel: input.verificationLevel,
      isVerified: input.isVerified,
    },
    include: {
      user: { select: { name: true, email: true } },
      primaryZone: true,
    },
  });
}
