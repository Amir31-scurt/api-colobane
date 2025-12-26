import { prisma } from "../../../infrastructure/prisma/prismaClient";
import slugify from "slugify";

type CreateProductDTO = {
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl: string;
    thumbnailUrl?: string;
    brandId?: number;
    categoryId: number;
};

export async function sellerCreateProductUsecase(sellerId: number, data: CreateProductDTO) {
    // 1. Determine Brand
    // For now, assume Seller has 1 Brand. If multiple, frontend must send brandId.
    // If brandId is sent, verify ownership.

    let targetBrandId = data.brandId;

    if (targetBrandId) {
        const brand = await prisma.brand.findUnique({ where: { id: targetBrandId } });
        if (!brand || brand.ownerId !== sellerId) {
            throw new Error("FORBIDDEN_BRAND_ACCESS");
        }
    } else {
        // Auto-find first brand
        const firstBrand = await prisma.brand.findFirst({ where: { ownerId: sellerId } });
        if (!firstBrand) throw new Error("NO_BRAND_FOUND");
        targetBrandId = firstBrand.id;
    }

    const slug = slugify(data.name, { lower: true, strict: true }) + "-" + Date.now();

    const product = await prisma.product.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            price: data.price,
            stock: data.stock,
            imageUrl: data.imageUrl,
            thumbnailUrl: data.thumbnailUrl,
            brandId: targetBrandId,
            isActive: true,
            categories: {
                connect: { id: data.categoryId }
            }
        },
    });

    await prisma.auditLog.create({
        data: {
            action: "PRODUCT_CREATED",
            actorId: sellerId,
            entityType: "Product",
            entityId: product.id.toString(),
            meta: { name: product.name, price: product.price },
        }
    });

    return product;
}
