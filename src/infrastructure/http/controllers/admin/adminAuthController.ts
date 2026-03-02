import { Request, Response } from "express";
import { adminLoginUsecase } from "../../../../core/usecases/admin/auth/adminLoginUsecase";
import { adminLogoutUsecase } from "../../../../core/usecases/admin/auth/adminLogoutUsecase";
import { googleLogin } from "../../../../core/usecases/auth/googleLogin";
import { signAccessToken } from "../../../../core/security/jwt";


export async function adminLoginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "INVALID_BODY" });

    const result = await adminLoginUsecase(String(email), String(password));
    return res.json(result);
  } catch (e: any) {
    const code = e?.message || "UNKNOWN";
    const status =
      code === "INVALID_CREDENTIALS" ? 401 :
        code === "USER_BLOCKED" ? 403 :
          code === "FORBIDDEN" ? 403 : 400;

    return res.status(status).json({ error: code });
  }
}

export async function adminLogoutController(req: Request, res: Response) {
  // Client side just drops cookie/token
  return res.json({ success: true });
}

/**
 * Google OAuth login for the admin/seller dashboard.
 *
 * Accepts a Google access token, verifies it with Google via the shared
 * googleLogin usecase, then checks the user's role (must be ADMIN or SELLER).
 * Issues a short-lived admin JWT on success.
 */
export async function adminGoogleLoginController(req: Request, res: Response) {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "INVALID_BODY" });

    // 1. Verify Google token and look up the user
    const result = await googleLogin({ token, phone: "" });
    const { user } = result;

    // 2. Blocked user — checked before role so the message is specific
    const { prisma } = await import("../../../prisma/prismaClient");
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (freshUser?.isBlocked) {
      return res.status(403).json({
        error: "USER_BLOCKED",
        reason: "Votre compte a été suspendu. Contactez le support Colobane.",
      });
    }

    // 3. Guard: only ADMIN or SELLER may access the dashboard
    if (user.role !== "ADMIN" && user.role !== "SELLER") {
      return res.status(403).json({
        error: "FORBIDDEN",
        reason:
          "Ce compte Google n'a pas encore le statut vendeur. " +
          "Votre boutique doit être approuvée par un administrateur avant de pouvoir accéder au tableau de bord.",
      });
    }

    // 4. Issue a dedicated admin JWT (4 h)
    const accessToken = signAccessToken(
      { sub: String(user.id), role: user.role as "ADMIN" | "SELLER" },
      "4h"
    );

    return res.json({
      accessToken,
      token: accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e: any) {
    const code = e?.message || "UNKNOWN";
    const status =
      code === "INVALID_GOOGLE_TOKEN" ? 401 :
      code === "PHONE_REQUIRED"       ? 422 :
      code === "USER_BLOCKED"         ? 403 : 500;

    const reason =
      code === "INVALID_GOOGLE_TOKEN"
        ? "Le jeton Google est invalide ou expiré. Veuillez réessayer."
        : code === "PHONE_REQUIRED"
        ? "Un numéro de téléphone est requis pour finaliser l'inscription."
        : "Une erreur inattendue s'est produite. Veuillez réessayer.";

    return res.status(status).json({ error: code, reason });
  }
}

export async function getAdminMeController(req: Request, res: Response) {
  try {
    const actor = req.auth;
    if (!actor) return res.status(401).json({ error: "UNAUTHORIZED" });

    // Fetch fresh data from DB
    const { prisma } = await import("../../../prisma/prismaClient");
    const user = await prisma.user.findUnique({
      where: { id: actor.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });

    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    return res.json(user);
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}
