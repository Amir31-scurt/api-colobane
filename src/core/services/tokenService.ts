// src/core/services/tokenService.ts
import jwt from "jsonwebtoken";

// Durées des tokens : 7 jours pour l'access token (idéal pour marketplace) et 30 jours pour le refresh token
const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
const REFRESH_TOKEN_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as jwt.SignOptions["expiresIn"];

interface JwtPayload {
  id: number;
  email: string | null;
  role: string;
  phone: string;
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  console.error("🔴 [tokenService] JWT secrets manquants ! Vérifiez JWT_ACCESS_SECRET et JWT_REFRESH_SECRET dans le .env ou le dashboard Render.");
  // Ne pas jeter d'erreur au top-level pour éviter le crash au démarrage, mais dans les fonctions.
}

export function createAccessToken(payload: JwtPayload): string {
  if (!JWT_ACCESS_SECRET) throw new Error("JWT_SECRETS_MISSING");
  
  return jwt.sign({ 
    ...payload, 
    sub: String(payload.id),
    type: 'access' 
  }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
}

export function createRefreshToken(payload: JwtPayload): string {
  if (!JWT_REFRESH_SECRET) throw new Error("JWT_SECRETS_MISSING");

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}
