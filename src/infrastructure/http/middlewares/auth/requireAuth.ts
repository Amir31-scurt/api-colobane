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
    const [, token] = header.split(" ");
    if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });

    const payload = verifyAccessToken(token);
    req.auth = { userId: Number(payload.sub), role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}
