"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListUsersUsecase = adminListUsersUsecase;
const prismaClient_1 = require("../../../../infrastructure/prisma/prismaClient");
async function adminListUsersUsecase(params) {
    const { page, pageSize, q, role } = params;
    const skip = (page - 1) * pageSize;
    const where = {};
    if (role)
        where.role = role;
    if (q) {
        where.OR = [
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
        ];
    }
    const [total, items] = await Promise.all([
        prismaClient_1.prisma.user.count({ where }),
        prismaClient_1.prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isBlocked: true,
                isActive: true,
                emailVerified: true,
                phoneVerified: true,
                emailVerifiedAt: true,
                createdAt: true,
            },
        }),
    ]);
    return { total, page, pageSize, items };
}
