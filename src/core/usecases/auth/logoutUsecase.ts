import { prisma } from "../../../infrastructure/prisma/prismaClient";


export async function logoutUseCase(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!stored) {
    // On ne révèle pas l’existence du token (sécurité)
    return;
  }

  if (stored.revoked) {
    return;
  }

  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  });
}
