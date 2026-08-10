// src/core/usecases/users/registerUser
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcryptjs";

interface RegisterUserInput {
  name: string;
  email?: string;
  password: string;
  phone: string;
}

/**
 * Normalizes a Senegalese phone number to a consistent format.
 * Always stores without + prefix so searches work consistently.
 * Examples:
 *   "77 000 00 00"  → "221770000000"
 *   "+221770000000" → "221770000000"
 *   "770000000"     → "221770000000"
 */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-\+\(\)]/g, '');
  if (digits.startsWith('221')) return digits;
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('3') || digits.startsWith('1'))) {
    return `221${digits}`;
  }
  return digits; // fallback — keep as-is for non-SN numbers
}

export async function registerUser(input: RegisterUserInput) {
  const normalizedPhone = normalizePhone(input.phone);

  // Check phone uniqueness
  const phoneExisting = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: normalizedPhone },
        { phone: input.phone },
      ]
    }
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
      phone: normalizedPhone  // Always store normalized
    }
  });

  return user;
}
