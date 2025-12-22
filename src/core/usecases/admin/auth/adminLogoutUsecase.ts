import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminLogoutUsecase(actorId: number) {
  await prisma.auditLog.create({
    data: {
      action: "ADMIN_LOGOUT",
      actorId,
      entityType: "User",
      entityId: String(actorId),
      meta: {},
    },
  });

  return { ok: true };
}
