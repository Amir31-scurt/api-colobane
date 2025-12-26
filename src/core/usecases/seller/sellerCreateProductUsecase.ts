import { prisma } from "../../../infrastructure/prisma/prismaClient";
import slugify from "slugify";

interface VariantInput {
    name: string;
    price?: number;
    stock: number;
    option1?: string;
    option2?: string;
    option3?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
}

type CreateProductDTO = {
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl: string;
    thumbnailUrl?: string;
    brandId?: number;
    categoryId: number;
    variants?: VariantInput[];
};

export async function sellerCreateProductUsecase(sellerId: number, data: CreateProductDTO) {
    // 1. Determine Brand
    let targetBrandId = data.brandId;

    if (targetBrandId) {
        const brand = await prisma.brand.findUnique({ where: { id: targetBrandId } });
        if (!brand || brand.ownerId !== sellerId) {
            throw new Error("FORBIDDEN_BRAND_ACCESS");
        }
    } else {
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
            },
            ...(data.variants && data.variants.length > 0 && {
                variants: {
                    create: data.variants.map(v => ({
                        name: v.name,
                        price: v.price ?? null,
                        stock: v.stock,
                        option1: v.option1,
                        option2: v.option2,
                        option3: v.option3,
                        imageUrl: v.imageUrl ?? null,
                        thumbnailUrl: v.thumbnailUrl ?? null
                    }))
                }
            })
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
