"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListProductsController = adminListProductsController;
exports.adminUpdateProductController = adminUpdateProductController;
exports.adminToggleProductActiveController = adminToggleProductActiveController;
const adminListProductsUsecase_1 = require("../../../../core/usecases/admin/products/adminListProductsUsecase");
const adminUpdateProductUsecase_1 = require("../../../../core/usecases/admin/products/adminUpdateProductUsecase");
const adminToggleProductActiveUsecase_1 = require("../../../../core/usecases/admin/products/adminToggleProductActiveUsecase");
async function adminListProductsController(req, res) {
    try {
        const page = Math.max(1, Number(req.query.page || 1));
        const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 20)));
        const q = req.query.q ? String(req.query.q) : undefined;
        // Support both 'status'/'stock' (new) and 'isActive'/'stockStatus' (legacy)
        const status = req.query.status || req.query.isActive;
        const stock = req.query.stock || req.query.stockStatus;
        const isActive = status === undefined || status === 'ALL' ? undefined : String(status) === "true" || String(status) === "active";
        const stockStatus = stock === undefined || stock === 'ALL' ? undefined : (stock === 'in_stock' || stock === 'IN_STOCK' ? 'IN_STOCK' : 'OUT_OF_STOCK');
        const data = await (0, adminListProductsUsecase_1.adminListProductsUsecase)({ page, pageSize, q, isActive, stockStatus });
        return res.json(data);
    }
    catch {
        return res.status(400).json({ error: "UNKNOWN" });
    }
}
async function adminUpdateProductController(req, res) {
    try {
        const productId = Number(req.params.id);
        if (!Number.isFinite(productId))
            return res.status(400).json({ error: "INVALID_ID" });
        const { price, stock, name, description, imageUrl } = req.body || {};
        const data = {};
        if (price !== undefined)
            data.price = Number(price);
        if (stock !== undefined)
            data.stock = Number(stock);
        if (name !== undefined)
            data.name = String(name);
        if (description !== undefined)
            data.description = description === null ? null : String(description);
        if (imageUrl !== undefined)
            data.imageUrl = imageUrl === null ? null : String(imageUrl);
        const updated = await (0, adminUpdateProductUsecase_1.adminUpdateProductUsecase)(productId, data);
        return res.json(updated);
    }
    catch (e) {
        return res.status(e?.message === "PRODUCT_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
    }
}
async function adminToggleProductActiveController(req, res) {
    try {
        const productId = Number(req.params.id);
        const { isActive } = req.body || {};
        if (!Number.isFinite(productId) || typeof isActive !== "boolean")
            return res.status(400).json({ error: "INVALID_BODY" });
        const updated = await (0, adminToggleProductActiveUsecase_1.adminToggleProductActiveUsecase)({
            actorId: req.auth.userId,
            productId,
            isActive,
        });
        return res.json(updated);
    }
    catch (e) {
        return res.status(e?.message === "PRODUCT_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
    }
}
