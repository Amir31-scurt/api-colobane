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

// ... existing code ...

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
