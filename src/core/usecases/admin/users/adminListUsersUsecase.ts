import { prisma } from "../../../../infrastructure/prisma/prismaClient";


export async function adminListUsersUsecase(params: {
  page: number;
  pageSize: number;
  q?: string;
  role?: "USER" | "SELLER" | "ADMIN";
}) {
  const { page, pageSize, q, role } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (role) where.role = role;

  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    }),
  ]);

  return { total, page, pageSize, items };
}
