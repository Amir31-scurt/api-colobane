"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminFeesReportUsecase = getAdminFeesReportUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function getAdminFeesReportUsecase() {
    const records = await prismaClient_1.prisma.feeRecord.findMany({
        include: {
            order: true
        }
    });
    const byName = records.reduce((acc, r) => {
        acc[r.name] = (acc[r.name] || 0) + r.appliedAmount;
        return acc;
    }, {});
    return {
        totalFees: records.reduce((s, r) => s + r.appliedAmount, 0),
        breakdown: byName,
        records
    };
}
