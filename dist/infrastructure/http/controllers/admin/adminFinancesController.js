"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportFinancesCsv = exports.createPayout = exports.listSellersFinances = void 0;
const adminGetSellersFinancesUsecase_1 = require("../../../../core/usecases/admin/finances/adminGetSellersFinancesUsecase");
const adminCreatePayoutUsecase_1 = require("../../../../core/usecases/admin/finances/adminCreatePayoutUsecase");
const exportFinancesCsvUsecase_1 = require("../../../../core/usecases/admin/finances/exportFinancesCsvUsecase");
const listSellersFinances = async (req, res) => {
    try {
        const finances = await (0, adminGetSellersFinancesUsecase_1.adminGetSellersFinancesUsecase)();
        res.json(finances);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.listSellersFinances = listSellersFinances;
const createPayout = async (req, res) => {
    try {
        const payout = await (0, adminCreatePayoutUsecase_1.adminCreatePayoutUsecase)(req.body);
        res.status(201).json(payout);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createPayout = createPayout;
const exportFinancesCsv = async (req, res) => {
    try {
        const type = req.query.type;
        const csv = await (0, exportFinancesCsvUsecase_1.exportFinancesCsvUsecase)(type);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=export_${type}.csv`);
        res.send(csv);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.exportFinancesCsv = exportFinancesCsv;
