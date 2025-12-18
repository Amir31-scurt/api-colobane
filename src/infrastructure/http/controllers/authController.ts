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

export async function registerController(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;

    const user = await registerUser({ name, email, password, phone });

    return res.status(201).json({
      message: "Utilisateur créé",
      user
    });
  } catch (err: any) {
    if (err.message === "EMAIL_ALREADY_USED") {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });

    return res.json({
      message: "Connexion réussie",
      user,
      token
    });
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }
    console.error(err);
    return res.status(500).json({ message: "Erreur interne" });
  }
}
export async function meController(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    return res.json({ user: req.user });
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