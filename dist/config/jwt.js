"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: "30m",
    });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: "30d",
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
