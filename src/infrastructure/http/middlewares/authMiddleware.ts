import express from "express";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyAccessToken } from "../../../core/services/tokenService";

dotenv.config();

// L’interface DOIT être exportée correctement
export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

// Middleware d'authentification
export function authRequired(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role
    };
    return next();
  } catch (err) {
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