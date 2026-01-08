"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListUsersController = adminListUsersController;
exports.adminUpdateUserRoleController = adminUpdateUserRoleController;
exports.adminToggleUserBlockController = adminToggleUserBlockController;
const adminListUsersUsecase_1 = require("../../../../core/usecases/admin/users/adminListUsersUsecase");
const adminUpdateUserRoleUsecase_1 = require("../../../../core/usecases/admin/users/adminUpdateUserRoleUsecase");
const adminToggleUserBlockUsecase_1 = require("../../../../core/usecases/admin/users/adminToggleUserBlockUsecase");
async function adminListUsersController(req, res) {
    try {
        const page = Math.max(1, Number(req.query.page || 1));
        const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 20)));
        const q = req.query.q ? String(req.query.q) : undefined;
        const role = req.query.role ? String(req.query.role) : undefined;
        const data = await (0, adminListUsersUsecase_1.adminListUsersUsecase)({ page, pageSize, q, role });
        return res.json(data);
    }
    catch {
        return res.status(400).json({ error: "UNKNOWN" });
    }
}
async function adminUpdateUserRoleController(req, res) {
    try {
        const userId = Number(req.params.id);
        const { role } = req.body || {};
        if (!Number.isFinite(userId) || !role)
            return res.status(400).json({ error: "INVALID_BODY" });
        const updated = await (0, adminUpdateUserRoleUsecase_1.adminUpdateUserRoleUsecase)({
            actorId: req.auth.userId,
            userId,
            role: String(role),
        });
        return res.json(updated);
    }
    catch (e) {
        return res.status(e?.message === "USER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
    }
}
async function adminToggleUserBlockController(req, res) {
    try {
        const userId = Number(req.params.id);
        const { isBlocked } = req.body || {};
        if (!Number.isFinite(userId) || typeof isBlocked !== "boolean")
            return res.status(400).json({ error: "INVALID_BODY" });
        const updated = await (0, adminToggleUserBlockUsecase_1.adminToggleUserBlockUsecase)({
            actorId: req.auth.userId,
            userId,
            isBlocked,
        });
        return res.json(updated);
    }
    catch (e) {
        return res.status(e?.message === "USER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
    }
}
