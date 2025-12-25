import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../../core/security/jwt";
import { verifyAccessToken as verifyUserToken } from "../../../core/services/tokenService";

declare global {
    namespace Express {
        interface Request {
            auth?: { userId: number; role: "USER" | "SELLER" | "ADMIN" };
            user?: { id: number; email: string; role: string; phone: string };
        }
    }
}

export function unifiedAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization || "";
    const [, token] = header.split(" ");

    if (!token) return res.status(401).json({ error: "UNAUTHORIZED", message: "Token manquant" });

    // 1. Try Admin/Seller Dashboard Token (JWT_SECRET)
    try {
        const payload = verifyAccessToken(token);
        req.auth = { userId: Number(payload.sub), role: payload.role };
        // Also set req.user for compatibility
        req.user = {
            id: Number(payload.sub),
            email: "admin@colobane.com", // Placeholder
            role: payload.role,
            phone: ""
        };
        return next();
    } catch (err) {
        // 2. Try User/Seller App Token (JWT_ACCESS_SECRET)
        try {
            const payload = verifyUserToken(token);
            req.user = {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                phone: payload.phone
            };
            // Also set req.auth for compatibility
            req.auth = {
                userId: payload.id,
                role: payload.role as "USER" | "SELLER" | "ADMIN"
            };
            return next();
        } catch (err2) {
            return res.status(401).json({ error: "UNAUTHORIZED", message: "Token invalide" });
        }
    }
}
