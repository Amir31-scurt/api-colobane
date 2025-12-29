import { Request, Response } from 'express';
import { toggleFavoriteUsecase } from '../../../core/usecases/users/toggleFavoriteUsecase';
import { getFavoritesUsecase } from '../../../core/usecases/users/getFavoritesUsecase';

export const toggleFavorite = async (req: Request, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const { productId } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!productId) return res.status(400).json({ message: "Product ID required" });

        const result = await toggleFavoriteUsecase(userId, Number(productId));
        res.json(result);
    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ message: "Error toggling favorite" });
    }
};

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const products = await getFavoritesUsecase(userId);
        res.json(products);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Error fetching favorites" });
    }
};
