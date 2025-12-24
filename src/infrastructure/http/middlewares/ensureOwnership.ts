import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

export async function ensureProductOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    const productId = Number(req.params.id);

    if (!userId || isNaN(productId)) {
        return res.status(400).json({ error: "INVALID_REQUEST" });
    }

    // Admin bypass
    if (req.user?.role === "ADMIN") {
        return next();
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { brand: true },
        });

        if (!product) {
            return res.status(404).json({ error: "NOT_FOUND" });
        }

        if (product.brand.ownerId !== userId) {
            return res.status(403).json({ error: "FORBIDDEN" });
        }

        next();
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
