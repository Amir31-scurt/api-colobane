import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function registerPushTokenController(req: AuthRequest, res: Response) {
  const { token, platform } = req.body;

  if (!token || !platform) {
    return res.status(400).json({
      message: "token et platform requis"
    });
  }

  await prisma.pushToken.upsert({
    where: { token },
    update: {
      isActive: true
    },
    create: {
      userId: req.user!.id,
      token,
      platform
    }
  });

  return res.json({ message: "Push token enregistré" });
}
