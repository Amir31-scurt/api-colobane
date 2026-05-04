// src/core/usecases/users/registerUser
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcryptjs";

interface RegisterUserInput {
  name: string;
  email?: string;
  password: string;
  phone: string;
}

export async function registerUser(input: RegisterUserInput) {
  // Check phone uniqueness
  const phoneExisting = await prisma.user.findUnique({
    where: { phone: input.phone }
  });
  if (phoneExisting) {
    throw new Error("PHONE_ALREADY_USED");
  }

  // Check email uniqueness if provided
  const emailToUse = input.email && input.email.trim() !== "" ? input.email.trim() : null;
  if (emailToUse) {
    const emailExisting = await prisma.user.findUnique({
      where: { email: emailToUse }
    });
    if (emailExisting) {
      throw new Error("EMAIL_ALREADY_USED");
    }
  }

  const hashed = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: emailToUse,
      password: hashed,
      phone: input.phone
    }
  });

  return user;
}
