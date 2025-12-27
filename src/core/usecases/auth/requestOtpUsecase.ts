import { createOtp } from "../../../infrastructure/auth/otp";
import { prisma } from "../../../infrastructure/prisma/prismaClient";


export async function requestOtpUseCase(phone: string) {
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name: `User ${phone}`, // placeholder name
        email: `${phone}@temp.colobane`, // temporary email (or use phone as email)
        password: "" // empty password, user will set it later
      }
    });
  }

  const otp = await createOtp(user.id);

  // DEV ONLY (plus tard SMS)


  return true;
}
