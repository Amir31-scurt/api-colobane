import { prisma } from "../../../infrastructure/prisma/prismaClient.ts";

export async function exportOrdersCsvUsecase() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      Payment: true
    }
  });

  const headers = [
    "order_id",
    "client",
    "phone",
    "total",
    "status",
    "payment_provider",
    "created_at"
  ];

  const rows = orders.map((o) => [
    o.id,
    o.user.name,
    o.user.phone,
    o.totalAmount,
    o.status,
    o.Payment[0]?.provider ?? "",
    o.createdAt.toISOString()
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  return csv;
}
