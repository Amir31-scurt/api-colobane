// src/core/usecases/auth/registerUsecase
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcrypt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export async function registerUsecase(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existing) {
    throw new Error("EMAIL_ALREADY_USED");
  }

  const hashed = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      phone: input.phone
      // role: CUSTOMER par défaut
    }
  });

  return user;
}
