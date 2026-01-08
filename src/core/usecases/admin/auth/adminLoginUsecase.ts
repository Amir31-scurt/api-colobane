import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { signAccessToken } from "../../../security/jwt";
import { verifyPassword } from "../../../security/password";


export async function adminLoginUsecase(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (user.isBlocked) throw new Error("USER_BLOCKED");

  // Allow both ADMIN and SELLER roles to login to the admin panel
  if (user.role !== "ADMIN" && user.role !== "SELLER") {
    throw new Error("FORBIDDEN");
  }

  if (!user.password) throw new Error("INVALID_CREDENTIALS");
  const ok = await verifyPassword(password, user.password);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  // Use the actual user role in the token
  const accessToken = signAccessToken({ sub: String(user.id), role: user.role as "ADMIN" | "SELLER" }, "4h");

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
    token: accessToken, // Alias for frontend compatibility
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    admin: { id: user.id, email: user.email, role: user.role }, // Legacy field
  };
}
