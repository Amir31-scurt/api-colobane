import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { signAccessToken } from "../../../security/jwt";
import { verifyPassword } from "../../../security/password";
import { createRefreshToken } from "../../../services/tokenService";


export async function adminLoginUsecase(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (user.isBlocked) throw new Error("USER_BLOCKED");

  // Allow both ADMIN and SELLER roles to login to the admin panel
  if (user.role !== "ADMIN" && user.role !== "SELLER") {
    throw new Error("FORBIDDEN");
  }

  // Google-only users have no password — they must use the Google login flow
  if (!user.password) {
    if (user.googleId) {
      throw new Error("GOOGLE_ACCOUNT_USE_GOOGLE_LOGIN");
    }
    throw new Error("INVALID_CREDENTIALS");
  }
  const ok = await verifyPassword(password, user.password);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  // Use the actual user role in the token
  const accessToken = signAccessToken({ sub: String(user.id), role: user.role as "ADMIN" | "SELLER" }, "4h");

  const refreshToken = createRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role,
    phone: user.phone || ""
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

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
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    admin: { id: user.id, email: user.email, role: user.role }, // Legacy field
  };
}
