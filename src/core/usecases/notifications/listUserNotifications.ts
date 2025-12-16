import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function listUserNotificationsUsecase(userId: number) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}
