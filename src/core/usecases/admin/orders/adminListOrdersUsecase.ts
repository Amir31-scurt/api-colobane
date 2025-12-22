import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminListOrdersUsecase(params: {
  page: number;
  pageSize: number;
  status?: string;
  q?: string; // recherche par id, email, phone, nom
}) {
  const { page, pageSize, status, q } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (status) where.status = status as any;

  if (q) {
    const qNum = Number(q);
    where.OR = [
      ...(Number.isFinite(qNum) ? [{ id: qNum }] : []),
      {
        user: {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        },
      },
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
        totalAmount: true,
        paidAt: true,
        deliveryFee: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        // Relation s'appelle "Payment" (capital P) dans ton schema
        Payment: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, provider: true, amount: true, currency: true, createdAt: true },
        },
      },
    }),
  ]);

  return { total, page, pageSize, items };
}
