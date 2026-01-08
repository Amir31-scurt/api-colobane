"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOverviewController = getAdminOverviewController;
exports.getAdminFeesController = getAdminFeesController;
exports.getAdminSellersController = getAdminSellersController;
exports.listAdminOrdersController = listAdminOrdersController;
exports.exportOrdersCsvController = exportOrdersCsvController;
exports.getAdminAlertsController = getAdminAlertsController;
exports.toggleSellerStatusController = toggleSellerStatusController;
const getAdminOverviewUsecase_1 = require("../../../core/usecases/admin/getAdminOverviewUsecase");
const getAdminFeesReportUsecase_1 = require("../../../core/usecases/admin/getAdminFeesReportUsecase");
const getSellersPerformanceUsecase_1 = require("../../../core/usecases/admin/getSellersPerformanceUsecase");
const listAdminOrdersUsecase_1 = require("../../../core/usecases/admin/listAdminOrdersUsecase");
const exportOrdersCsvUsecase_1 = require("../../../core/usecases/admin/exportOrdersCsvUsecase");
const getAdminAlertsUsecase_1 = require("../../../core/usecases/admin/getAdminAlertsUsecase");
async function getAdminOverviewController(req, res) {
    const data = await (0, getAdminOverviewUsecase_1.getAdminOverviewUsecase)();
    return res.json(data);
}
async function getAdminFeesController(req, res) {
    const data = await (0, getAdminFeesReportUsecase_1.getAdminFeesReportUsecase)();
    return res.json(data);
}
async function getAdminSellersController(req, res) {
    const data = await (0, getSellersPerformanceUsecase_1.getSellersPerformanceUsecase)();
    return res.json(data);
}
async function listAdminOrdersController(req, res) {
    const { status, from, to, paymentProvider, phone, onlyCashPending } = req.query;
    const orders = await (0, listAdminOrdersUsecase_1.listAdminOrdersUsecase)({
        status: status,
        from: from ? new Date(from.toString()) : undefined,
        to: to ? new Date(to.toString()) : undefined,
        paymentProvider: paymentProvider,
        phone: phone?.toString(),
        onlyCashPending: onlyCashPending === "true"
    });
    return res.json(orders);
}
async function exportOrdersCsvController(req, res) {
    const csv = await (0, exportOrdersCsvUsecase_1.exportOrdersCsvUsecase)();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.send(csv);
}
async function getAdminAlertsController(req, res) {
    try {
        const alerts = await (0, getAdminAlertsUsecase_1.getAdminAlertsUsecase)();
        return res.json(alerts);
    }
    catch (err) {
        console.error("ADMIN_ALERTS_ERROR:", err);
        return res.status(500).json({
            message: "Erreur lors de la récupération des alertes admin"
        });
    }
}
async function toggleSellerStatusController(req, res) {
    try {
        const sellerId = Number(req.params.sellerId);
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "Le champ isActive doit être un boolean"
            });
        }
        const updatedSeller = await (0, getSellersPerformanceUsecase_1.toggleSellerStatusUsecase)(sellerId, isActive);
        return res.json({
            message: `Vendeur ${isActive ? "activé" : "désactivé"} avec succès`,
            seller: {
                id: updatedSeller.id,
                name: updatedSeller.name,
                email: updatedSeller.email,
                isActive: updatedSeller.isActive
            }
        });
    }
    catch (err) {
        console.error("TOGGLE_SELLER_STATUS_ERROR:", err);
        return res.status(500).json({
            message: "Erreur lors de la mise à jour du statut du vendeur"
        });
    }
}
