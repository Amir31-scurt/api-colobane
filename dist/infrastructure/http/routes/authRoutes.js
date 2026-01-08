"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const router = express_1.default.Router();
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
router.post("/register", authController_1.registerController);
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
router.post("/login", authController_1.loginController);
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
router.get("/me", requireAuth_1.requireAuth, authController_1.meController);
router.patch("/me", requireAuth_1.requireAuth, authController_1.updateProfileController);
router.post("/refresh-token", authController_1.refreshTokenController);
router.post("/request-password-reset", authController_1.requestPasswordResetController);
router.post("/reset-password", authController_1.resetPasswordController);
router.post("/otp/request", authController_1.requestOtpController);
router.post("/otp/verify", authController_1.verifyOtpController);
router.post("/google", authController_1.googleLoginController);
router.post("/facebook", authController_1.facebookLoginController);
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
router.post("/logout", authController_1.logoutController);
exports.default = router;
