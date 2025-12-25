import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export async function listNotificationsController(req: any, res: Response) {
  const userId = req.auth?.userId || req.user?.id;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return res.json(notifications);
}

export async function markNotificationReadController(req: any, res: Response) {
  const userId = req.auth?.userId || req.user?.id;
  if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

  const id = Number(req.params.notificationId);

  const notif = await prisma.notification.findFirst({
    where: { id, userId }
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
