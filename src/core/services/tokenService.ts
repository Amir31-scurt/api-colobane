// src/core/services/tokenService.ts
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "15m"; // à ajuster si besoin
const REFRESH_TOKEN_EXPIRES_IN = "30d";

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  phone: string;
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  console.warn("⚠️ JWT secrets manquants dans les variables d'environnement.");
}

export function createAccessToken(payload: JwtPayload): string {
  return jwt.sign({ 
    ...payload, 
    sub: String(payload.id),
    type: 'access' 
  }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
}

export function createRefreshToken(payload: JwtPayload): string {
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
