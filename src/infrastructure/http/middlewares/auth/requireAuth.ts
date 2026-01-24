import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../../../core/services/tokenService";

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
    // tokenService returns { id, email, role, phone ... }
    // requireAuth expects payload to have 'sub' ??
    // Actually tokenService.createAccessToken puts 'sub: String(payload.id)'
    // BUT verifyAccessToken returns "JwtPayload" interface which is { id, email, role... } + whatever jwt.verify returns
    // jwt.verify returns the full decoded object.
    
    // Let's safe cast. tokenService defines interface JwtPayload { id, email, role, phone }
    
    req.auth = { userId: payload.id, role: payload.role as "USER" | "SELLER" | "ADMIN" };

    return next();
  } catch (error: any) {
    console.error("[requireAuth] Token verification failed:", error.message);
    return res.status(401).json({ error: "UNAUTHORIZED", message: error.message || "Token verification failed" });
  }
}
