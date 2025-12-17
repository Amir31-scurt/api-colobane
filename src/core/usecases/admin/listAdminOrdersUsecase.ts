import { prisma } from "../../../infrastructure/prisma/prismaClient";
import type { OrderStatus, PaymentProvider } from "@prisma/client";

interface AdminOrderFilters {
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  paymentProvider?: PaymentProvider;
  phone?: string;
  onlyCashPending?: boolean;
}

export async function listAdminOrdersUsecase(filters: AdminOrderFilters) {
  return prisma.order.findMany({
    where: {
      AND: [
        filters.status ? { status: filters.status } : {},
        filters.from ? { createdAt: { gte: filters.from } } : {},
        filters.to ? { createdAt: { lte: filters.to } } : {},
        filters.phone
          ? {
              user: {
                phone: { contains: filters.phone }
              }
            }
          : {},
        filters.paymentProvider
          ? {
              payments: {
                some: { provider: filters.paymentProvider }
              }
            }
          : {},
        filters.onlyCashPending
          ? {
              payments: {
                some: {
                  provider: "CASH",
                  status: "WAITING_CONFIRMATION"
                }
              }
            }
          : {}
      ]
    },
    include: {
      user: true,
      payments: true,
      deliveryAssignments: {
        include: {
          deliverer: { include: { user: true } }
        }
      },
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
