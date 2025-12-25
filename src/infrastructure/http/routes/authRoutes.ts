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
  logoutController
} from "../controllers/authController";
import { authRequired } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Gestion des comptes utilisateurs (inscription, connexion, OTP)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, phone]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Utilisateur créé
 */
router.post("/register", registerController);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Succès avec tokens
 */
router.post("/login", loginController);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Profil de l'utilisateur connecté
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 */
router.get("/me", authRequired, meController);

router.post("/refresh-token", refreshTokenController);

router.post("/request-password-reset", requestPasswordResetController);
router.post("/reset-password", resetPasswordController);

router.post("/otp/request", requestOtpController);
router.post("/otp/verify", verifyOtpController);

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
