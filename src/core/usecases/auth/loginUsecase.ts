// src/core/usecases/auth/loginUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcrypt";
import {
  createAccessToken,
  createRefreshToken
} from "../../services/tokenService";

export async function loginUsecase(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    phone: user.phone
  };

  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

  return { user, accessToken, refreshToken };
}
