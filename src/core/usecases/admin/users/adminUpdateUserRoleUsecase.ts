import { UserRole } from "@prisma/client";
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export async function adminUpdateUserRoleUsecase(params: {
  actorId: number;
  userId: number;
  role: UserRole;
}) {
  const { actorId, userId, role } = params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await prisma.auditLog.create({
    data: {
      action: "USER_ROLE_UPDATED",
      actorId,
      entityType: "User",
      entityId: String(userId),
      meta: { from: user.role, to: role },
    },
  });

  return updated;
}
