"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeliveryFeeUsecase = calculateDeliveryFeeUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const geoUtils_1 = require("../../helpers/geoUtils");
async function calculateDeliveryFeeUsecase(input) {
    const { items, deliveryMethodId, deliveryLocationId } = input;
    if (!items || items.length === 0)
        return { fee: 0 };
    const deliveryMethod = await prismaClient_1.prisma.deliveryMethod.findUnique({
        where: { id: deliveryMethodId }
    });
    if (!deliveryMethod)
        throw new Error("INVALID_DELIVERY_METHOD");
    if (deliveryMethod.code === 'SELF_COLLECT') {
        return { fee: 0 };
    }
    // Standard Delivery
    if (!deliveryLocationId)
        return { fee: 0 }; // Cannot calculate yet
    const deliveryLocation = await prismaClient_1.prisma.referenceLocation.findUnique({
        where: { id: deliveryLocationId },
        include: { deliveryZone: true }
    });
    if (!deliveryLocation)
        throw new Error("INVALID_DELIVERY_LOCATION");
    // Fetch products to get Brand Locations
    const productIds = items.map(i => i.productId);
    const products = await prismaClient_1.prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
            brand: {
                include: { location: true }
            }
        }
    });
    let totalDeliveryFee = 0;
    const brandIds = new Set(products.map(p => p.brandId));
    for (const brandId of brandIds) {
        const brandProduct = products.find(p => p.brandId === brandId);
        const brand = brandProduct?.brand;
        if (!brand || !brand.location) {
            // Fallback
            totalDeliveryFee += 1500;
            continue;
        }
        const distance = (0, geoUtils_1.calculateDistance)(brand.location.latitude, brand.location.longitude, deliveryLocation.latitude, deliveryLocation.longitude);
        const baseFee = deliveryLocation.deliveryZone?.baseFee || 1500;
        const fee = (0, geoUtils_1.calculateDeliveryFee)(distance, baseFee);
        totalDeliveryFee += fee;
    }
    return { fee: totalDeliveryFee };
}
