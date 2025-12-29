import express from "express";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyAccessToken } from "../../../core/services/tokenService";

dotenv.config();

// L’interface DOIT être exportée correctement
export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string, phone: string };
}

// Middleware d'authentification
export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  console.log('[authMiddleware] Authorization header:', header ? header.substring(0, 30) + '...' : 'missing');

  if (!header || !header.startsWith("Bearer ")) {
    console.log('[authMiddleware] ❌ No Bearer token');
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = header.split(" ")[1];
  console.log('[authMiddleware] Token extracted:', token.substring(0, 20) + '...');

  try {
    const payload = verifyAccessToken(token);
    console.log('[authMiddleware] ✅ Token valid. User:', payload.id, payload.email, payload.role);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      phone: payload.phone
    };
    return next();
  } catch (err) {
    console.log('[authMiddleware] ❌ Token verification failed:', err);
    return res.status(401).json({ message: "Token invalide" });
  }
}

// Vérification du rôle ADMIN
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  return next(); // IMPORTANT
}
export function isSeller(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "SELLER" && req.user.role !== "ADMIN")) {
    return res.status(403).json({ message: "Accès réservé aux vendeurs" });
  }
  return next();
}