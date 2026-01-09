"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellerDashboardController = getSellerDashboardController;
const getSellerDashboardUsecase_1 = require("../../../core/usecases/seller/getSellerDashboardUsecase");
async function getSellerDashboardController(req, res) {
    try {
        const ownerId = req.user.id;
        const stats = await (0, getSellerDashboardUsecase_1.getSellerDashboardUsecase)(ownerId);
        return res.json(stats);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne dashboard seller" });
    }
}
