"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../../../../core/security/jwt");
function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const [scheme, token] = header.split(" ");
        if (!token) {
            return res.status(401).json({ error: "UNAUTHORIZED", message: "No token provided" });
        }
        if (scheme?.toLowerCase() !== "bearer") {
            return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid auth scheme, use Bearer" });
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.auth = { userId: Number(payload.sub), role: payload.role };
        return next();
    }
    catch (error) {
        console.error("[requireAuth] Token verification failed:", error.message);
        return res.status(401).json({ error: "UNAUTHORIZED", message: error.message || "Token verification failed" });
    }
}
