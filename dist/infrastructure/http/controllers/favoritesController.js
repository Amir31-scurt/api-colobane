"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.toggleFavorite = void 0;
const toggleFavoriteUsecase_1 = require("../../../core/usecases/users/toggleFavoriteUsecase");
const getFavoritesUsecase_1 = require("../../../core/usecases/users/getFavoritesUsecase");
const toggleFavorite = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        const { productId } = req.body;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        if (!productId)
            return res.status(400).json({ message: "Product ID required" });
        const result = await (0, toggleFavoriteUsecase_1.toggleFavoriteUsecase)(userId, Number(productId));
        res.json(result);
    }
    catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ message: "Error toggling favorite" });
    }
};
exports.toggleFavorite = toggleFavorite;
const getFavorites = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const products = await (0, getFavoritesUsecase_1.getFavoritesUsecase)(userId);
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Error fetching favorites" });
    }
};
exports.getFavorites = getFavorites;
