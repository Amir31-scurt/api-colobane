import { Request, Response } from "express";
import { sellerGetStatsUsecase } from "../../../../core/usecases/seller/sellerGetStatsUsecase";
import { sellerListProductsUsecase } from "../../../../core/usecases/seller/sellerListProductsUsecase";
import { sellerCreateProductUsecase } from "../../../../core/usecases/seller/sellerCreateProductUsecase";
import { sellerUpdateProductUsecase } from "../../../../core/usecases/seller/sellerUpdateProductUsecase";
import { sellerListOrdersUsecase } from "../../../../core/usecases/seller/sellerListOrdersUsecase";
import { sellerUpdateBrandUsecase } from "../../../../core/usecases/seller/sellerUpdateBrandUsecase";
import { sellerGetBrandUsecase } from "../../../../core/usecases/seller/sellerGetBrandUsecase";
import { sellerGetProductUsecase } from "../../../../core/usecases/seller/sellerGetProductUsecase";



export async function sellerGetStatsController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const stats = await sellerGetStatsUsecase(userId);
        return res.json(stats);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerListProductsController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.q as string;
        const status = req.query.status as string;
        const stock = req.query.stock as string;

        const result = await sellerListProductsUsecase(userId, page, pageSize, search, status, stock);
        return res.json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerCreateProductController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
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
        const userId = req.auth!.userId;
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
        const userId = req.auth!.userId;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const status = req.query.status as string;
        const search = req.query.q as string;

        const result = await sellerListOrdersUsecase(userId, page, pageSize, status, search);
        return res.json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerUpdateBrandController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const body = req.body;
        const brand = await sellerUpdateBrandUsecase(userId, body);
        return res.json(brand);
    } catch (e: any) {
        console.error(e);
        if (e.message === "NO_BRAND_FOUND") return res.status(404).json({ error: "NO_BRAND" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerGetBrandController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const brand = await sellerGetBrandUsecase(userId);
        if (!brand) return res.status(404).json({ error: "NO_BRAND" });
        return res.json(brand);
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
export async function sellerGetProductController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const productId = Number(req.params.id);
        const product = await sellerGetProductUsecase(userId, productId);
        return res.json(product);
    } catch (e: any) {
        console.error(e);
        if (e.message === "PRODUCT_NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
        if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
