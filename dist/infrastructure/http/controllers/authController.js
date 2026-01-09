"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.meController = meController;
exports.refreshTokenController = refreshTokenController;
exports.requestPasswordResetController = requestPasswordResetController;
exports.resetPasswordController = resetPasswordController;
exports.requestOtpController = requestOtpController;
exports.verifyOtpController = verifyOtpController;
exports.logoutController = logoutController;
exports.updateProfileController = updateProfileController;
exports.googleLoginController = googleLoginController;
exports.appleLoginController = appleLoginController;
const registerUser_1 = require("../../../core/usecases/users/registerUser");
const login_1 = require("../../../core/usecases/auth/login");
const refreshTokenUsecase_1 = require("../../../core/usecases/auth/refreshTokenUsecase");
const requestPasswordResetUsecase_1 = require("../../../core/usecases/auth/requestPasswordResetUsecase");
const resetPasswordUsecase_1 = require("../../../core/usecases/auth/resetPasswordUsecase");
const verifyOtpUsecase_1 = require("../../../core/usecases/auth/verifyOtpUsecase");
const requestOtpUsecase_1 = require("../../../core/usecases/auth/requestOtpUsecase");
const logoutUsecase_1 = require("../../../core/usecases/auth/logoutUsecase");
const updateProfileUsecase_1 = require("../../../core/usecases/users/updateProfileUsecase");
async function registerController(req, res) {
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
        const user = await (0, registerUser_1.registerUser)({ name, email, password, phone });
        return res.status(201).json({
            message: "Utilisateur créé",
            user
        });
    }
    catch (err) {
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
async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        const { user, token } = await (0, login_1.loginUser)({ email, password });
        return res.json({
            message: "Connexion réussie",
            user,
            token
        });
    }
    catch (err) {
        if (err.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne" });
    }
}
async function meController(req, res) {
    try {
        const actor = req.auth;
        if (!actor) {
            return res.status(401).json({ message: "Non authentifié" });
        }
        // Fetch fresh user data from DB
        const { prisma } = await Promise.resolve().then(() => __importStar(require("../../prisma/prismaClient")));
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
    }
    catch (error) {
        console.error("[meController] Error:", error);
        return res.status(401).json({ message: "Non authentifié" });
    }
}
async function refreshTokenController(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token manquant" });
        }
        const tokens = await (0, refreshTokenUsecase_1.refreshTokenUsecase)(refreshToken);
        return res.json(tokens);
    }
    catch (err) {
        if (err.message === "INVALID_REFRESH_TOKEN") {
            return res.status(401).json({ message: "Refresh token invalide" });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne" });
    }
}
async function requestPasswordResetController(req, res) {
    const { email } = req.body;
    await (0, requestPasswordResetUsecase_1.requestPasswordResetUsecase)(email);
    return res.json({
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été généré."
    });
}
async function resetPasswordController(req, res) {
    try {
        const { token, newPassword } = req.body;
        await (0, resetPasswordUsecase_1.resetPasswordUsecase)(token, newPassword);
        return res.json({ message: "Mot de passe réinitialisé avec succès." });
    }
    catch (err) {
        if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
            return res.status(400).json({ message: "Token invalide ou expiré." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne" });
    }
}
async function requestOtpController(req, res) {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: "Numéro requis" });
    }
    await (0, requestOtpUsecase_1.requestOtpUseCase)(phone);
    res.json({ status: "ok", message: "OTP envoyé" });
}
async function verifyOtpController(req, res) {
    const { phone, code } = req.body;
    if (!phone || !code) {
        return res.status(400).json({ message: "Données manquantes" });
    }
    const tokens = await (0, verifyOtpUsecase_1.verifyOtpUseCase)(phone, code);
    res.json({
        status: "ok",
        ...tokens,
    });
}
async function logoutController(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            message: "refreshToken requis",
        });
    }
    await (0, logoutUsecase_1.logoutUseCase)(refreshToken);
    return res.status(200).json({
        status: "ok",
        message: "Déconnexion réussie",
    });
}
async function updateProfileController(req, res) {
    try {
        // req.user from authRequired, req.auth from requireAuth
        const userId = req.user?.id || req.auth?.userId;
        if (!userId)
            return res.status(401).json({ message: "Non authentifié" });
        const { name, password, avatarUrl } = req.body;
        const updatedUser = await (0, updateProfileUsecase_1.updateProfileUsecase)({
            userId,
            name,
            password,
            avatarUrl
        });
        return res.json({
            message: "Profil mis à jour",
            user: updatedUser
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne" });
    }
}
const googleLogin_1 = require("../../../core/usecases/auth/googleLogin");
async function googleLoginController(req, res) {
    try {
        const { token, phone } = req.body;
        if (!token)
            return res.status(400).json({ message: "Token requis" });
        const result = await (0, googleLogin_1.googleLogin)({ token, phone });
        return res.json({
            message: "Connexion Google réussie",
            ...result
        });
    }
    catch (err) {
        console.error("Google Login Error:", err);
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
const appleLogin_1 = require("../../../core/usecases/auth/appleLogin");
async function appleLoginController(req, res) {
    try {
        const { token, phone, name } = req.body;
        if (!token)
            return res.status(400).json({ message: "Token requis" });
        const result = await (0, appleLogin_1.appleLogin)({ token, phone, name });
        return res.json({
            message: "Connexion Apple réussie",
            ...result
        });
    }
    catch (err) {
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
