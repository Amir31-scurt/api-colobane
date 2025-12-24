import { prisma } from "../../../../infrastructure/prisma/prismaClient";

export type ExportFinancesType = "sales" | "payments" | "commissions";

export async function exportFinancesCsvUsecase(type: ExportFinancesType) {
    switch (type) {
        case "sales":
            return exportSales();
        case "payments":
            return exportPayments();
        case "commissions":
            return exportCommissions();
        default:
            throw new Error("INVALID_EXPORT_TYPE");
    }
}

async function exportSales() {
    const orders = await prisma.order.findMany({
        include: {
            user: true,
            Payment: true,
            items: {
                include: {
                    product: {
                        include: {
                            brand: true
                        }
                    }
                }
            }
        }
    });

    const headers = ["Order ID", "Client", "Total", "Status", "Date", "Sellers"];
    const rows = orders.map(o => {
        const sellers = Array.from(new Set(o.items.map(i => i.product.brand.name))).join("; ");
        return [
            o.id,
            o.user.name,
            o.totalAmount,
            o.status,
            o.createdAt.toISOString(),
            `"${sellers}"`
        ];
    });

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

async function exportPayments() {
    const payments = await prisma.payment.findMany({
        include: {
            order: {
                include: {
                    user: true
                }
            }
        }
    });

    const headers = ["Payment ID", "Order ID", "Client", "Amount", "Provider", "Status", "Ref", "Date"];
    const rows = payments.map(p => [
        p.id,
        p.orderId,
        p.order.user.name,
        p.amount,
        p.provider,
        p.status,
        p.providerRef ?? "",
        p.createdAt.toISOString()
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

async function exportCommissions() {
    const fees = await prisma.feeRecord.findMany({
        include: {
            seller: true,
            order: true
        }
    });

    const headers = ["Fee ID", "Order ID", "Seller", "Fee Name", "Amount Applied", "Date"];
    const rows = fees.map(f => [
        f.id,
        f.orderId,
        f.seller?.name ?? "System",
        f.name,
        f.appliedAmount,
        f.createdAt.toISOString()
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}
