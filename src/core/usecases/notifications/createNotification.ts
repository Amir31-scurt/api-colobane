import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface CreateNotificationInput {
  userId: number;
  type: "ORDER_CREATED" | "ORDER_PAID" | "ORDER_SHIPPED" | "ORDER_COMPLETED" | "GENERIC";
  title: string;
  message: string;
  data?: any;
}

export async function createNotificationUsecase(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? null
    }
  });
}
