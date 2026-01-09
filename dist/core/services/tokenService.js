"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessToken = createAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
// src/core/services/tokenService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // à ajuster si besoin
const REFRESH_TOKEN_EXPIRES_IN = "30d";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    console.warn("⚠️ JWT secrets manquants dans les variables d'environnement.");
}
function createAccessToken(payload) {
    return jsonwebtoken_1.default.sign({
        ...payload,
        sub: String(payload.id),
        type: 'access'
    }, JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
}
function createRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
}
