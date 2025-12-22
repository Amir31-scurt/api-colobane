import jwt, { SignOptions } from "jsonwebtoken";

export type JwtPayload = {
  sub: string; // userId
  role: "USER" | "SELLER" | "ADMIN";
  type: "access";
};

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in env");

export function signAccessToken(
    payload: Omit<JwtPayload, "type">,
    expiresIn: SignOptions["expiresIn"] = "2h"
  ) {
    const token = jwt.sign(
      { ...payload, type: "access" },
      JWT_SECRET as string,
      { expiresIn }
    );
  
    return token;
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  if (decoded.type !== "access") throw new Error("INVALID_TOKEN_TYPE");
  return decoded;
}
