import { Request, Response } from "express";
import axios from "axios";
import { adminLoginUsecase } from "../../../../core/usecases/admin/auth/adminLoginUsecase";
import { adminLogoutUsecase } from "../../../../core/usecases/admin/auth/adminLogoutUsecase";
import { signAccessToken } from "../../../../core/security/jwt";
import { prisma } from "../../../prisma/prismaClient";


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
 * Flow:
 *  1. Verify the Google access token with Google's userinfo endpoint.
 *  2. Look up the user by email in the database — NO account creation.
 *  3. Check role: only ADMIN or SELLER may proceed.
 *  4. Issue a short-lived admin JWT.
 *
 * Every failure path returns an explicit French message in `reason`.
 */
export async function adminGoogleLoginController(req: Request, res: Response) {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({
        error: "INVALID_BODY",
        reason: "Le jeton Google est manquant.",
      });
    }

    // ── 1. Verify token with Google ──────────────────────────────────────────
    let googleEmail: string;
    let googleId: string;
    try {
      const { data } = await axios.get<{ sub: string; email: string }>(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${token}` }, timeout: 8000 }
      );
      if (!data.email) throw new Error("NO_EMAIL");
      googleEmail = data.email.toLowerCase();
      googleId = data.sub;
    } catch {
      return res.status(401).json({
        error: "INVALID_GOOGLE_TOKEN",
        reason: "Le jeton Google est invalide ou expiré. Veuillez réessayer.",
      });
    }

    // ── 2. Look up existing user by email — never create ─────────────────────
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: googleEmail }, { googleId }] },
    });

    if (!user) {
      return res.status(403).json({
        error: "ACCOUNT_NOT_FOUND",
        reason:
          `Aucun compte Colobane n'est associé à l'adresse ${googleEmail}. ` +
          "Inscrivez-vous d'abord sur colobane.com, puis demandez l'activation de votre boutique.",
      });
    }

    // ── 3. Blocked check ─────────────────────────────────────────────────────
    if (user.isBlocked) {
      return res.status(403).json({
        error: "USER_BLOCKED",
        reason: "Votre compte a été suspendu. Contactez le support Colobane pour plus d'informations.",
      });
    }

    // ── 4. Role check — only ADMIN or SELLER ─────────────────────────────────
    if (user.role !== "ADMIN" && user.role !== "SELLER") {
      return res.status(403).json({
        error: "NOT_A_SELLER",
        reason:
          "Seuls les vendeurs approuvés peuvent accéder à ce tableau de bord. " +
          "Votre boutique doit être approuvée par un administrateur Colobane avant votre premier accès.",
      });
    }

    // ── 5. Link googleId if missing (user may have registered with email) ─────
    if (!user.googleId) {
      await prisma.user.update({ where: { id: user.id }, data: { googleId } });
    }

    // ── 6. Issue admin JWT (4 h) ──────────────────────────────────────────────
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
    console.error("[adminGoogleLogin]", e);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      reason: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    });
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
