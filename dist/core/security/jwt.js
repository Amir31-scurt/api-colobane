"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Unified Secret Key Logic
// We prioritize JWT_ACCESS_SECRET to align with tokenService.ts used by Google/Apple login
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "";
if (!JWT_SECRET)
    throw new Error("Missing JWT_ACCESS_SECRET or JWT_SECRET in env");
function signAccessToken(payload, expiresIn = "2h") {
    const token = jsonwebtoken_1.default.sign({ ...payload, type: "access" }, JWT_SECRET, { expiresIn });
    return token;
}
function verifyAccessToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    if (decoded.type !== "access")
        throw new Error("INVALID_TOKEN_TYPE");
    return decoded;
}
