import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken } from "../../services/tokenService";

interface LoginInput {
  identifier: string; // can be email or phone
  password: string;
}

export async function loginUser(input: LoginInput) {
  const isEmail = input.identifier.includes('@');
  
  const user = await prisma.user.findFirst({
    where: isEmail ? { email: input.identifier } : { phone: input.identifier }
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.password) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const match = await bcrypt.compare(input.password, user.password);
  if (!match) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Create token with format compatible with requireAuth middleware
  // Must include: sub (userId), role, type: "access"
  // Create token using centralized service
  const token = createAccessToken({
      id: user.id,
      email: user.email, // can be null
      role: user.role,
      phone: user.phone
  });

  const refreshToken = createRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phone: user.phone
  });

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
      createdAt: user.createdAt
    },
    token,
    refreshToken
  };
}
