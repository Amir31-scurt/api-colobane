import { Request, Response, NextFunction } from "express";

export function requireRole(...roles: Array<"USER" | "SELLER" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.auth?.role;
    if (!role) return res.status(401).json({ error: "UNAUTHORIZED" });
    if (!roles.includes(role)) return res.status(403).json({ error: "FORBIDDEN" });
    return next();
  };
}
