// src/core/usecases/users/registerUser
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcryptjs";

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export async function registerUser(input: RegisterUserInput) {
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
    }
  });

  return user;
}
