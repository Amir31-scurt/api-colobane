"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureProductOwnership = ensureProductOwnership;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function ensureProductOwnership(req, res, next) {
    const userId = req.auth?.userId || req.user?.id;
    const userRole = req.auth?.role || req.user?.role;
    const productId = Number(req.params.id);
    if (!userId || isNaN(productId)) {
        return res.status(400).json({ error: "INVALID_REQUEST" });
    }
    // Admin bypass
    if (userRole === "ADMIN") {
        return next();
    }
    try {
        const product = await prismaClient_1.prisma.product.findUnique({
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
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
