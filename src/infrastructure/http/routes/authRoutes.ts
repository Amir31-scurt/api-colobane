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
import { authRateLimiter, otpRateLimiter } from "../../../config/rateLimit";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Gestion de l'authentification (Register, Login, OTP, etc.)
 */

// Inscription classique (email/pass)
router.post("/register", authRateLimiter, registerController);

// Connexion classique (email/pass)
router.post("/login", authRateLimiter, loginController);

// Réinitialisation de mot de passe
router.post("/forgot-password", authRateLimiter, requestPasswordResetController);
router.post("/reset-password", authRateLimiter, resetPasswordController);

// OTP (pour app mobile sans email/pass ou 2FA)
router.post("/otp/request", otpRateLimiter, requestOtpController);
router.post("/otp/verify", authRateLimiter, verifyOtpController);

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
