import { prisma } from "../../../infrastructure/prisma/prismaClient";
import slugify from "slugify";

interface UpdateBrandDTO {
    name?: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    bannerUrl?: string;
    website?: string;
}

export async function sellerUpdateBrandUsecase(userId: number, data: UpdateBrandDTO) {
    // Check if user has a brand
    const brand = await prisma.brand.findFirst({
        where: { ownerId: userId }
    });

    if (!brand) {
        throw new Error("NO_BRAND_FOUND");
    }

    let newSlug = brand.slug;

    // Handle name change and slug update
    if (data.name && data.name !== brand.name) {
        let baseSlug = slugify(data.name, { lower: true, strict: true });
        newSlug = baseSlug;

        // Ensure uniqueness
        let counter = 1;
        while (await prisma.brand.findUnique({ where: { slug: newSlug } })) {
            newSlug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    // Update brand
    const updatedBrand = await prisma.brand.update({
        where: { id: brand.id },
        data: {
            name: data.name ?? brand.name,
            slug: newSlug,
            description: data.description ?? brand.description,
            primaryColor: data.primaryColor ?? brand.primaryColor,
            secondaryColor: data.secondaryColor ?? brand.secondaryColor,
            logoUrl: data.logoUrl ?? brand.logoUrl,
            bannerUrl: data.bannerUrl ?? brand.bannerUrl,
            website: data.website ?? brand.website,
        }
    });

    return updatedBrand;
}
