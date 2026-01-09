"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListOrdersController = adminListOrdersController;
exports.adminGetOrderController = adminGetOrderController;
exports.adminUpdateOrderStatusController = adminUpdateOrderStatusController;
const adminGetOrderUsecase_1 = require("../../../../core/usecases/admin/orders/adminGetOrderUsecase");
const adminUpdateOrderStatusUsecase_1 = require("../../../../core/usecases/admin/orders/adminUpdateOrderStatusUsecase");
const adminListOrdersUsecase_1 = require("../../../../core/usecases/admin/orders/adminListOrdersUsecase");
async function adminListOrdersController(req, res) {
    try {
        const page = Math.max(1, Number(req.query.page || 1));
        const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 20)));
        const status = req.query.status ? String(req.query.status) : undefined;
        const q = req.query.q ? String(req.query.q) : undefined;
        // Nouveaux filtres
        const minAmount = req.query.minAmount ? Number(req.query.minAmount) : undefined;
        const maxAmount = req.query.maxAmount ? Number(req.query.maxAmount) : undefined;
        const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
        const data = await (0, adminListOrdersUsecase_1.adminListOrdersUsecase)({
            page,
            pageSize,
            status,
            q,
            minAmount,
            maxAmount,
            startDate,
            endDate
        });
        return res.json(data);
    }
    catch {
        return res.status(400).json({ error: "UNKNOWN" });
    }
}
async function adminGetOrderController(req, res) {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isFinite(orderId))
            return res.status(400).json({ error: "INVALID_ID" });
        const data = await (0, adminGetOrderUsecase_1.adminGetOrderUsecase)(orderId);
        return res.json(data);
    }
    catch (e) {
        return res.status(e?.message === "ORDER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
    }
}
async function adminUpdateOrderStatusController(req, res) {
    try {
        const orderId = Number(req.params.id);
        const { status, note } = req.body || {};
        if (!Number.isFinite(orderId) || !status)
            return res.status(400).json({ error: "INVALID_BODY" });
        const updated = await (0, adminUpdateOrderStatusUsecase_1.adminUpdateOrderStatusUsecase)({
            actorId: req.auth.userId,
            orderId,
            status: String(status),
            note: note ? String(note) : undefined,
        });
        return res.json(updated);
    }
    catch (e) {
        return res.status(e?.message === "ORDER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
    }
}
