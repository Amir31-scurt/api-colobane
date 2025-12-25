import { Request, Response } from "express";
import { sellerGetStatsUsecase } from "../../../../core/usecases/seller/sellerGetStatsUsecase";
import { sellerListProductsUsecase } from "../../../../core/usecases/seller/sellerListProductsUsecase";
import { sellerCreateProductUsecase } from "../../../../core/usecases/seller/sellerCreateProductUsecase";
import { sellerUpdateProductUsecase } from "../../../../core/usecases/seller/sellerUpdateProductUsecase";
import { sellerListOrdersUsecase } from "../../../../core/usecases/seller/sellerListOrdersUsecase";



export async function sellerGetStatsController(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const stats = await sellerGetStatsUsecase(userId);
        return res.json(stats);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerListProductsController(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.q as string;

        const result = await sellerListProductsUsecase(userId, page, pageSize, search);
        return res.json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerCreateProductController(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const body = req.body;
        const product = await sellerCreateProductUsecase(userId, body);
        return res.status(201).json(product);
    } catch (e: any) {
        console.error(e);
        if (e.message === "FORBIDDEN_BRAND_ACCESS") return res.status(403).json({ error: "FORBIDDEN" });
        if (e.message === "NO_BRAND_FOUND") return res.status(400).json({ error: "NO_BRAND" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerUpdateProductController(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const productId = Number(req.params.id);
        const body = req.body;
        const product = await sellerUpdateProductUsecase(userId, productId, body);
        return res.json(product);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerListOrdersController(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;

        const result = await sellerListOrdersUsecase(userId, page, pageSize);
        return res.json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
