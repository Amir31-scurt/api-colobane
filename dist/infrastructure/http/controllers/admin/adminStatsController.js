"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminStatsController = adminStatsController;
exports.adminGetTimeSeriesStatsController = adminGetTimeSeriesStatsController;
exports.adminGetKPIsController = adminGetKPIsController;
const adminGetStatsUsecase_1 = require("../../../../core/usecases/admin/stats/adminGetStatsUsecase");
const adminGetTimeSeriesStatsUsecase_1 = require("../../../../core/usecases/admin/stats/adminGetTimeSeriesStatsUsecase");
const adminGetKPIsUsecase_1 = require("../../../../core/usecases/admin/stats/adminGetKPIsUsecase");
async function adminStatsController(_, res) {
    try {
        const data = await (0, adminGetStatsUsecase_1.adminGetStatsUsecase)();
        return res.json(data);
    }
    catch {
        return res.status(400).json({ error: "UNKNOWN" });
    }
}
async function adminGetTimeSeriesStatsController(_, res) {
    try {
        const data = await (0, adminGetTimeSeriesStatsUsecase_1.adminGetTimeSeriesStatsUsecase)();
        return res.json(data);
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: "UNKNOWN" });
    }
}
async function adminGetKPIsController(_, res) {
    try {
        const data = await (0, adminGetKPIsUsecase_1.adminGetKPIsUsecase)();
        return res.json(data);
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: "UNKNOWN" });
    }
}
