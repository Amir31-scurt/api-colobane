import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../../../core/security/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: number; role: "USER" | "SELLER" | "ADMIN" };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (!token) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "No token provided" });
    }

    if (scheme?.toLowerCase() !== "bearer") {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid auth scheme, use Bearer" });
    }

    const payload = verifyAccessToken(token);
    req.auth = { userId: Number(payload.sub), role: payload.role };

    return next();
  } catch (error: any) {
    console.error("[requireAuth] Token verification failed:", error.message);
    return res.status(401).json({ error: "UNAUTHORIZED", message: error.message || "Token verification failed" });
  }
}
