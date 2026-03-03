import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../../../core/security/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: number; role: "CUSTOMER" | "USER" | "SELLER" | "ADMIN" };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    if (!header) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "No Authorization header" });
    }

    const [scheme, token] = header.split(" ");

    if (!token || token === "null" || token === "undefined") {
      console.warn("🟠 [requireAuth] Missing or invalid token string:", token);
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Token missing or 'null'/'undefined'" });
    }

    if (scheme?.toLowerCase() !== "bearer") {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid auth scheme, use Bearer" });
    }

    const payload = verifyAccessToken(token);
    
    // Support both 'sub' (JWT standard) and 'id' (legacy/other)
    const userId = payload.sub || (payload as any).id;
    if (!userId) {
      throw new Error("TOKEN_MISSING_USER_ID");
    }

    req.auth = { userId: Number(userId), role: payload.role };

    return next();
  } catch (error: any) {
    const message = error.message || "Token verification failed";
    console.error(`🔴 [requireAuth] Auth failed: ${message}`);
    return res.status(401).json({ 
      error: "UNAUTHORIZED", 
      message: message === "jwt malformed" ? "Format de jeton invalide (malformed)" : message
    });
  }
}
