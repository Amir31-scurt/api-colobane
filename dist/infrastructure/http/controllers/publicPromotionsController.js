"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listActivePromotionsController = listActivePromotionsController;
const listActivePromotions_1 = require("../../../core/usecases/promotions/listActivePromotions");
async function listActivePromotionsController(req, res) {
    try {
        const promotions = await (0, listActivePromotions_1.listActivePromotions)();
        return res.json(promotions);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur récupération promotions" });
    }
}
