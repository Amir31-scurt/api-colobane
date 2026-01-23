// src/infrastructure/http/routes/authRoutes.ts
import express from "express";
import {
  registerController,
  loginController,
  meController,
  refreshTokenController,
  requestPasswordResetController,
  resetPasswordController,
  verifyOtpController,
  requestOtpController,
  logoutController,
  updateProfileController,
  googleLoginController,
  appleLoginController
} from "../controllers/authController";
import { authRequired } from "../middlewares/authMiddleware";
import { requireAuth } from "../middlewares/auth/requireAuth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Gestion de l'authentification (Register, Login, OTP, etc.)
 */

// Inscription classique (email/pass)
router.post("/register", registerController);

// Connexion classique (email/pass)
router.post("/login", loginController);

// Réinitialisation de mot de passe
router.post("/forgot-password", requestPasswordResetController);
router.post("/reset-password", resetPasswordController);

// OTP (pour app mobile sans email/pass ou 2FA)
router.post("/otp/request", requestOtpController);
router.post("/otp/verify", verifyOtpController);

// Profile
router.get("/me", requireAuth, meController);
router.patch("/me", requireAuth, updateProfileController);
router.post("/refresh-token", refreshTokenController);

router.post("/google", googleLoginController);
router.post("/apple", appleLoginController);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Déconnecté
 */
router.post("/logout", logoutController);

export default router;
