import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function adminToggleUserBlockUsecase(params: {
  actorId: number;
  userId: number;
  isBlocked: boolean;
}) {
  const { actorId, userId, isBlocked } = params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked
    },
  });

  await prisma.auditLog.create({
    data: {
      action: isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
      actorId,
      entityType: "User",
      entityId: String(userId),
      meta: { from: user.isBlocked, to: isBlocked },
    },
  });

  return updated;
}
