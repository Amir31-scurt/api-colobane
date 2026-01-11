import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { createAccessToken, createRefreshToken } from "../../services/tokenService";
import jwt from "jsonwebtoken";

interface AppleLoginInput {
  token: string;
  phone: string;
  name?: string;
}

interface AppleJwtPayload {
  sub: string;
  email: string;
}

export async function appleLogin(input: AppleLoginInput) {
  // 1. Decode token
  // TODO: Verify token signature using Apple's public keys (JWKS)
  const decoded = jwt.decode(input.token) as AppleJwtPayload | null;

  if (!decoded || !decoded.sub || !decoded.email) {
    throw new Error("INVALID_APPLE_TOKEN");
  }

  const { sub: appleId, email } = decoded;

  // 2. Find user by appleId
  let user = await prisma.user.findUnique({
    where: { appleId }
  });

  // 3. If not found, find by email
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Link account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { appleId }
      });
    } else {
      // User doesn't exist, create new
      if (!input.phone) {
        throw new Error("PHONE_REQUIRED");
      }

      // Check if phone unique
      const phoneExists = await prisma.user.findUnique({
        where: { phone: input.phone }
      });
      if (phoneExists) {
        throw new Error("PHONE_ALREADY_USED");
      }

      user = await prisma.user.create({
        data: {
          email,
          name: input.name || "Apple User",
          appleId,
          emailVerified: true,
          role: "CUSTOMER",
          isActive: true,
          phone: input.phone
        }
      });
    }
  }

  // 4. Generate Tokens
  const tokenPayload = {
      id: user.id,
      email: user.email!,
      role: user.role,
      phone: user.phone
  };

  const token = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl
    },
    token,
    refreshToken
  };
}
