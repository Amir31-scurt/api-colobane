"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellerFinances = void 0;
const sellerGetFinancesUsecase_1 = require("../../../../core/usecases/seller/finances/sellerGetFinancesUsecase");
const getSellerFinances = async (req, res) => {
    try {
        const sellerId = req.auth.userId;
        const finances = await (0, sellerGetFinancesUsecase_1.sellerGetFinancesUsecase)(sellerId);
        res.json(finances);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSellerFinances = getSellerFinances;
