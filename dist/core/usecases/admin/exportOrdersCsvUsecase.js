"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportOrdersCsvUsecase = exportOrdersCsvUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function exportOrdersCsvUsecase() {
    const orders = await prismaClient_1.prisma.order.findMany({
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
