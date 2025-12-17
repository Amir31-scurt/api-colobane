import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listNotificationsController(req: AuthRequest, res: Response) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return res.json(notifications);
}

export async function markNotificationReadController(req: AuthRequest, res: Response) {
  const id = Number(req.params.notificationId);

  const notif = await prisma.notification.findFirst({
    where: { id, userId: req.user!.id }
  });

  if (!notif) {
    return res.status(404).json({ message: "Notification introuvable" });
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  return res.json({ message: "Notification marquée comme lue" });
}
