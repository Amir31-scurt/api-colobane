// src/infrastructure/http/controllers/authController
import type { Request, Response } from "express";
import { registerUser } from "../../../core/usecases/users/registerUser";
import { loginUser } from "../../../core/usecases/auth/login";
import { type AuthRequest } from "../middlewares/authMiddleware";
import { refreshTokenUsecase } from "../../../core/usecases/auth/refreshTokenUsecase";
import { requestPasswordResetUsecase } from "../../../core/usecases/auth/requestPasswordResetUsecase";
import { resetPasswordUsecase } from "../../../core/usecases/auth/resetPasswordUsecase";
import { verifyOtpUseCase } from "../../../core/usecases/auth/verifyOtpUsecase";
import { requestOtpUseCase } from "../../../core/usecases/auth/requestOtpUsecase";
import { logoutUseCase } from "../../../core/usecases/auth/logoutUsecase";
import { updateProfileUsecase } from "../../../core/usecases/users/updateProfileUsecase";

export async function registerController(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Tous les champs sont requis",
        missing: {
          name: !name,
          email: !email,
          password: !password,
          phone: !phone
        }
      });
    }

    const user = await registerUser({ name, email, password, phone });

    return res.status(201).json({
      message: "Utilisateur créé",
      user
    });
  } catch (err: any) {
    if (err.message === "EMAIL_ALREADY_USED") {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    // Handle Prisma validation errors
    if (err.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        message: "Données invalides",
        error: err.message
      });
    }

    console.error('[registerController] Error:', err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { user, token, refreshToken } = await loginUser({ email, password });

    return res.json({
      message: "Connexion réussie",
      user,
      token,
      refreshToken
    });
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}
export async function meController(req: Request, res: Response) {
  try {
    const actor = req.auth;
    if (!actor) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    // Fetch fresh user data from DB
    const { prisma } = await import("../../prisma/prismaClient");
    const user = await prisma.user.findUnique({
      where: { id: actor.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("[meController] Error:", error);
    return res.status(401).json({ message: "Non authentifié" });
  }
}

export async function refreshTokenController(req: AuthRequest, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token manquant" });
    }

    const tokens = await refreshTokenUsecase(refreshToken);
    return res.json(tokens);
  } catch (err: any) {
    if (err.message === "INVALID_REFRESH_TOKEN") {
      return res.status(401).json({ message: "Refresh token invalide" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}

export async function requestPasswordResetController(req: AuthRequest, res: Response) {
  const { email } = req.body;
  await requestPasswordResetUsecase(email);
  return res.json({
    message: "Si un compte existe avec cet email, un lien de réinitialisation a été généré."
  });
}

export async function resetPasswordController(req: AuthRequest, res: Response) {
  try {
    const { token, newPassword } = req.body;
    await resetPasswordUsecase(token, newPassword);
    return res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err: any) {
    if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}

export async function requestOtpController(req: Request, res: Response) {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Numéro requis" });
  }

  await requestOtpUseCase(phone);

  res.json({ status: "ok", message: "OTP envoyé" });
}

export async function verifyOtpController(req: Request, res: Response) {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: "Données manquantes" });
  }

  const tokens = await verifyOtpUseCase(phone, code);

  res.json({
    status: "ok",
    ...tokens,
  });
}

export async function logoutController(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: "refreshToken requis",
    });
  }

  await logoutUseCase(refreshToken);

  return res.status(200).json({
    status: "ok",
    message: "Déconnexion réussie",
  });
}

export async function updateProfileController(req: AuthRequest, res: Response) {
  try {
    // req.user from authRequired, req.auth from requireAuth
    const userId = req.user?.id || req.auth?.userId;
    if (!userId) return res.status(401).json({ message: "Non authentifié" });

    const { name, password, avatarUrl } = req.body;
    const updatedUser = await updateProfileUsecase({
      userId,
      name,
      password,
      avatarUrl
    });

    return res.json({
      message: "Profil mis à jour",
      user: updatedUser
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}

import { googleLogin } from "../../../core/usecases/auth/googleLogin";

export async function googleLoginController(req: Request, res: Response) {
  try {
    console.log("🔵 [googleLoginController] Request received");
    const { token, phone } = req.body;
    
    if (!token) {
      console.warn("🟠 [googleLoginController] Missing token in body");
      return res.status(400).json({ message: "Token requis" });
    }

    console.log("🔵 [googleLoginController] calling googleLogin usecase...");
    const result = await googleLogin({ token, phone });
    console.log("🟢 [googleLoginController] Success");

    return res.json({
      message: "Connexion Google réussie",
      ...result
    });
  } catch (err: any) {
    console.error("🔴 [googleLoginController] Error caught:", err);
    if (err.message === "INVALID_GOOGLE_TOKEN") {
      return res.status(401).json({ message: "Token Google invalide" });
    }
    if (err.message === "PHONE_REQUIRED_FOR_NEW_USER" || err.message === "PHONE_REQUIRED") {
      return res.status(422).json({ 
        message: "Numéro de téléphone requis pour l'inscription",
        code: "PHONE_REQUIRED" 
      });
    }
    if (err.message === "PHONE_ALREADY_USED") {
      return res.status(409).json({ message: "Ce numéro de téléphone est déjà utilisé par un autre compte." });
    }
    return res.status(500).json({ message: "Erreur lors de la connexion Google" });
  }
}

import { appleLogin } from "../../../core/usecases/auth/appleLogin";

export async function appleLoginController(req: Request, res: Response) {
  try {
    const { token, phone, name } = req.body;
    if (!token) return res.status(400).json({ message: "Token requis" });

    const result = await appleLogin({ token, phone, name });
    return res.json({
      message: "Connexion Apple réussie",
      ...result
    });
  } catch (err: any) {
    console.error("Apple Login Error:", err);
    if (err.message === "INVALID_APPLE_TOKEN") {
      return res.status(401).json({ message: "Token Apple invalide" });
    }
    if (err.message === "PHONE_REQUIRED_FOR_NEW_USER" || err.message === "PHONE_REQUIRED") {
      return res.status(422).json({ 
        message: "Numéro de téléphone requis pour l'inscription",
        code: "PHONE_REQUIRED" 
      });
    }
    if (err.message === "PHONE_ALREADY_USED") {
      return res.status(409).json({ message: "Ce numéro de téléphone est déjà utilisé par un autre compte." });
    }
    return res.status(500).json({ message: "Erreur lors de la connexion Apple" });
  }
}
