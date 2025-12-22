import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminListOrdersUsecase(params: {
  page: number;
  pageSize: number;
  status?: string;
  q?: string;
}) {
  const { page, pageSize, status, q } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status) where.status = status;

  if (q) {
    const qNum = Number(q);
    where.OR = [
      ...(Number.isFinite(qNum) ? [{ id: qNum }] : []),
      { customerEmail: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        status: true,
        Payment: true,
        totalAmount: true,
        // serviceFee: true,
        deliveryFee: true,
        user: true,
        // customerPhone: true,
        createdAt: true,
      },
    }),
  ]);

  return { total, page, pageSize, items };
}
