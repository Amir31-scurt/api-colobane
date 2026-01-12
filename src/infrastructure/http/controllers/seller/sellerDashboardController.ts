import { Request, Response } from "express";
import { sellerGetStatsUsecase } from "../../../../core/usecases/seller/sellerGetStatsUsecase";
import { sellerListProductsUsecase } from "../../../../core/usecases/seller/sellerListProductsUsecase";
import { sellerCreateProductUsecase } from "../../../../core/usecases/seller/sellerCreateProductUsecase";
import { sellerUpdateProductUsecase } from "../../../../core/usecases/seller/sellerUpdateProductUsecase";
import { sellerListOrdersUsecase } from "../../../../core/usecases/seller/sellerListOrdersUsecase";
import { sellerUpdateBrandUsecase } from "../../../../core/usecases/seller/sellerUpdateBrandUsecase";
import { sellerGetBrandUsecase } from "../../../../core/usecases/seller/sellerGetBrandUsecase";
import { sellerGetProductUsecase } from "../../../../core/usecases/seller/sellerGetProductUsecase";
import { sellerDeleteProductUsecase } from "../../../../core/usecases/seller/sellerDeleteProductUsecase";
import { createPromotionUsecase } from "../../../../core/usecases/promotions/createPromotionUsecase";
import { listPromotionsUsecase } from "../../../../core/usecases/promotions/listPromotionsUsecase";
import { getPromotionUsecase } from "../../../../core/usecases/promotions/getPromotionUsecase";
import { updatePromotionUsecase } from "../../../../core/usecases/promotions/updatePromotionUsecase";
import { togglePromotionUsecase } from "../../../../core/usecases/promotions/togglePromotionUsecase";
import { assignPromotionToProductsUsecase } from "../../../../core/usecases/promotions/assignPromotionToProductsUsecase";
import { prisma } from "../../../prisma/prismaClient";


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
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

        const result = await sellerListProductsUsecase(userId, page, pageSize, search, status, stock, categoryId);
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

export async function sellerDeleteProductController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const productId = Number(req.params.id);
        await sellerDeleteProductUsecase(userId, productId);
        return res.status(204).send();
    } catch (e: any) {
        console.error(e);
        if (e.message === "PRODUCT_NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
        if (e.message === "FORBIDDEN") return res.status(403).json({ error: "FORBIDDEN" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerGetOrderController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const orderId = Number(req.params.id);
        
        // Dynamic import to avoid circular dependencies if any
        const { sellerGetOrderUsecase } = await import("../../../../core/usecases/seller/sellerGetOrderUsecase");
        const order = await sellerGetOrderUsecase(userId, orderId);
        
        return res.json(order);
    } catch (e: any) {
        console.error(e);
        if (e.message === "ORDER_NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
        if (e.message === "FORBIDDEN_ACCESS") return res.status(403).json({ error: "FORBIDDEN" });
        if (e.message === "NO_BRAND_FOUND") return res.status(400).json({ error: "NO_BRAND" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerUpdateOrderStatusController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const orderId = Number(req.params.id);
        const { status } = req.body;

        const { sellerUpdateOrderStatusUsecase } = await import("../../../../core/usecases/seller/sellerUpdateOrderStatusUsecase");
        const order = await sellerUpdateOrderStatusUsecase(userId, orderId, status);
        
        return res.json(order);
    } catch (e: any) {
        console.error(e);
        if (e.message === "ORDER_NOT_FOUND") return res.status(404).json({ error: "NOT_FOUND" });
        if (e.message === "FORBIDDEN_ACCESS") return res.status(403).json({ error: "FORBIDDEN" });
        if (e.message === "INVALID_STATUS") return res.status(400).json({ error: "INVALID_STATUS" });
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

// ==================== PROMOTIONS ====================

export async function sellerCreatePromotionController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const body = req.body;

        // Get seller's brand
        const brand = await prisma.brand.findFirst({ where: { ownerId: userId } });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        // Create promotion restricted to seller's brand
        const promotion = await createPromotionUsecase({
            name: body.name,
            description: body.description,
            discountType: body.discountType,
            discountValue: body.discountValue,
            startsAt: new Date(body.startsAt),
            endsAt: new Date(body.endsAt),
            isActive: body.isActive ?? true,
            productIds: body.productIds || [],
            brandIds: [brand.id], // Restrict to seller's brand only
            categoryIds: body.categoryIds || []
        });

        return res.status(201).json(promotion);
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerListPromotionsController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;

        // Get seller's brand
        const brand = await prisma.brand.findFirst({ where: { ownerId: userId } });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        // Get only promotions for this seller's brand
        const promotions = await prisma.promotion.findMany({
            where: {
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        thumbnailUrl: true
                    }
                },
                brands: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                categories: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json(promotions);
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerGetPromotionController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const promotionId = Number(req.params.id);

        // Get seller's brand
        const brand = await prisma.brand.findFirst({ where: { ownerId: userId } });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        // Get promotion and verify ownership
        const promotion = await prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            },
            include: {
                products: true,
                brands: true,
                categories: true
            }
        });

        if (!promotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }

        return res.json(promotion);
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerUpdatePromotionController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const promotionId = Number(req.params.id);
        const body = req.body;

        // Get seller's brand
        const brand = await prisma.brand.findFirst({ where: { ownerId: userId } });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        // Verify ownership
        const existingPromotion = await prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            }
        });

        if (!existingPromotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }

        // Update promotion
        const promotion = await updatePromotionUsecase(promotionId, {
            name: body.name,
            description: body.description,
            discountType: body.discountType,
            discountValue: body.discountValue,
            startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
            endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
            isActive: body.isActive
        });

        return res.json(promotion);
    } catch (e: any) {
        console.error(e);
        if (e.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerTogglePromotionController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const promotionId = Number(req.params.id);
        const { isActive } = req.body;

        // Get seller's brand
        const brand = await prisma.brand.findFirst({ where: { ownerId: userId } });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        // Verify ownership
        const existingPromotion = await prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            }
        });

        if (!existingPromotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }

        // Toggle promotion
        const promotion = await togglePromotionUsecase(promotionId, Boolean(isActive));
        return res.json(promotion);
    } catch (e: any) {
        console.error(e);
        if (e.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

export async function sellerAssignPromotionToProductsController(req: Request, res: Response) {
    try {
        const userId = req.auth!.userId;
        const promotionId = Number(req.params.id);
        const { productIds } = req.body;

        // Get seller's brand
        const brand = await prisma.brand.findFirst({ where: { ownerId: userId } });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        // Verify promotion ownership
        const existingPromotion = await prisma.promotion.findFirst({
            where: {
                id: promotionId,
                brands: {
                    some: {
                        id: brand.id
                    }
                }
            }
        });

        if (!existingPromotion) {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }

        // Verify all products belong to seller
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                brandId: brand.id
            }
        });

        if (products.length !== productIds.length) {
            return res.status(403).json({ error: "FORBIDDEN - Some products don't belong to you" });
        }

        // Assign products to promotion
        const promotion = await assignPromotionToProductsUsecase(promotionId, productIds);
        return res.json(promotion);
    } catch (e: any) {
        console.error(e);
        if (e.message === "PROMOTION_NOT_FOUND") {
            return res.status(404).json({ error: "PROMOTION_NOT_FOUND" });
        }
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
