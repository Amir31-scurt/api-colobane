"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.isAdmin = isAdmin;
exports.isSeller = isSeller;
const dotenv_1 = __importDefault(require("dotenv"));
const tokenService_1 = require("../../../core/services/tokenService");
dotenv_1.default.config();
// Middleware d'authentification
function authRequired(req, res, next) {
    const header = req.headers.authorization;
    console.log('[authMiddleware] Authorization header:', header ? header.substring(0, 30) + '...' : 'missing');
    if (!header || !header.startsWith("Bearer ")) {
        console.log('[authMiddleware] ❌ No Bearer token');
        return res.status(401).json({ message: "Token manquant" });
    }
    const token = header.split(" ")[1];
    console.log('[authMiddleware] Token extracted:', token.substring(0, 20) + '...');
    try {
        const payload = (0, tokenService_1.verifyAccessToken)(token);
        console.log('[authMiddleware] ✅ Token valid. User:', payload.id, payload.email, payload.role);
        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            phone: payload.phone
        };
        return next();
    }
    catch (err) {
        console.log('[authMiddleware] ❌ Token verification failed:', err);
        return res.status(401).json({ message: "Token invalide" });
    }
}
// Vérification du rôle ADMIN
function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Accès refusé" });
    }
    return next(); // IMPORTANT
}
function isSeller(req, res, next) {
    if (!req.user || (req.user.role !== "SELLER" && req.user.role !== "ADMIN")) {
        return res.status(403).json({ message: "Accès réservé aux vendeurs" });
    }
    return next();
}
