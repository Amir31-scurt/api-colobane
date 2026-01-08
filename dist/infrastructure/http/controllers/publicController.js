"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicStatsController = getPublicStatsController;
const getPublicStats_1 = require("../../../core/usecases/public/getPublicStats");
async function getPublicStatsController(req, res) {
    try {
        const stats = await (0, getPublicStats_1.getPublicStats)();
        return res.json(stats);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur récupération statistiques publiques" });
    }
}
