// src/core/usecases/auth/loginUser
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
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
  const token = jwt.sign(
    {
      sub: String(user.id),  // userId as string
      id: user.id,           // Keep for backward compatibility
      email: user.email,
      role: user.role,
      type: "access"         // Required by jwt.ts verifyAccessToken
    },
    String(process.env.JWT_SECRET),
    { expiresIn: String(process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"] }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt
    },
    token
  };
}

