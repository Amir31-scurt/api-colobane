"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = searchController;
const searchAll_1 = require("../../../core/usecases/search/searchAll");
async function searchController(req, res) {
    const q = String(req.query.q || "");
    const result = await (0, searchAll_1.searchAllUsecase)(q);
    return res.json(result);
}
