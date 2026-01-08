"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unifiedAuth = unifiedAuth;
const jwt_1 = require("../../../core/security/jwt");
const tokenService_1 = require("../../../core/services/tokenService");
function unifiedAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [, token] = header.split(" ");
    if (!token)
        return res.status(401).json({ error: "UNAUTHORIZED", message: "Token manquant" });
    // 1. Try Admin/Seller Dashboard Token (JWT_SECRET)
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.auth = { userId: Number(payload.sub), role: payload.role };
        // Also set req.user for compatibility
        req.user = {
            id: Number(payload.sub),
            email: "admin@colobane.com", // Placeholder
            role: payload.role,
            phone: ""
        };
        return next();
    }
    catch (err) {
        // 2. Try User/Seller App Token (JWT_ACCESS_SECRET)
        try {
            const payload = (0, tokenService_1.verifyAccessToken)(token);
            req.user = {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                phone: payload.phone
            };
            // Also set req.auth for compatibility
            req.auth = {
                userId: payload.id,
                role: payload.role
            };
            return next();
        }
        catch (err2) {
            return res.status(401).json({ error: "UNAUTHORIZED", message: "Token invalide" });
        }
    }
}
