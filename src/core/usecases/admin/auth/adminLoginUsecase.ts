import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { signAccessToken } from "../../../security/jwt";
import { verifyPassword } from "../../../security/password";


export async function adminLoginUsecase(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (user.isBlocked) throw new Error("USER_BLOCKED");
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

  const ok = await verifyPassword(password, user.password);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const accessToken = signAccessToken({ sub: String(user.id), role: "ADMIN" }, "4h");

  await prisma.auditLog.create({
    data: {
      action: "ADMIN_LOGIN",
      actorId: user.id,
      entityType: "User",
      entityId: String(user.id),
      meta: { email: user.email },
    },
  });

  return {
    accessToken,
    admin: { id: user.id, email: user.email, role: user.role },
  };
}
