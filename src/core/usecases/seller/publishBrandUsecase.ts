/**
 * publishBrandUsecase.ts
 *
 * Replaces the old admin-approval gate.
 * Validates required fields, then immediately sets the brand live
 * (isActive=true, approvalStatus=APPROVED) and promotes the owner to SELLER.
 *
 * Decision: store goes live WITHOUT requiring a product first.
 * The chat immediately prompts for the first product after publishing.
 */

import { prisma } from "../../../infrastructure/prisma/prismaClient";
import slugify from "slugify";
import { validateStoreFields, OnboardingState } from "./onboardingStateMachine";

export type PublishBrandInput = {
  userId: number;
  ownerName: string;
  brandName: string;
  activity: string;
  categorySlug: string;
  location: string;
  contactPhone: string;
  logoUrl?: string;
};

export type PublishBrandResult =
  | { ok: true; brandId: number; brandSlug: string }
  | { ok: false; errors: string[] };

export async function publishBrandUsecase(
  input: PublishBrandInput
): Promise<PublishBrandResult> {
  // 1. Validate required fields using the state machine validator
  const stateForValidation: OnboardingState = {
    ownerName: input.ownerName,
    brandName: input.brandName,
    activity: input.activity,
    categorySlug: input.categorySlug,
    location: input.location,
    contactPhone: input.contactPhone,
  };

  const validationErrors = validateStoreFields(stateForValidation);
  if (validationErrors.length > 0) {
    return { ok: false, errors: validationErrors };
  }

  // 2. Check if user already has a brand
  const existingBrand = await prisma.brand.findFirst({
    where: { ownerId: input.userId },
  });

  if (existingBrand) {
    // Already has a brand — check if it just needs activation
    if (existingBrand.isActive && existingBrand.approvalStatus === "APPROVED") {
      return { ok: true, brandId: existingBrand.id, brandSlug: existingBrand.slug };
    }
    // Re-activate it with updated info
    const updated = await prisma.brand.update({
      where: { id: existingBrand.id },
      data: {
        name: input.brandName,
        phone: input.contactPhone,
        whatsappNumber: input.contactPhone,
        description: input.activity,
        logoUrl: input.logoUrl ?? existingBrand.logoUrl,
        isActive: true,
        approvalStatus: "APPROVED",
        reviewedAt: new Date(),
      },
    });
    await ensureSellerRole(input.userId);
    await updateOnboardingRecord(input.userId, updated.id);
    return { ok: true, brandId: updated.id, brandSlug: updated.slug };
  }

  // 3. Generate unique slug from brand name
  const baseSlug = slugify(input.brandName, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.brand.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // 4. Resolve category
  const category = await prisma.category.findUnique({
    where: { slug: input.categorySlug },
  });

  // 5. Create brand — immediately live, no approval gate
  const brand = await prisma.brand.create({
    data: {
      name: input.brandName,
      slug,
      ownerId: input.userId,
      description: input.activity,  // activity becomes the description
      phone: input.contactPhone,
      whatsappNumber: input.contactPhone,
      logoUrl: input.logoUrl,
      isActive: true,
      approvalStatus: "APPROVED",
      reviewedAt: new Date(),
      submittedAt: new Date(),
      ...(category && {
        categories: { connect: { id: category.id } },
      }),
    },
  });

  // 6. Promote user to SELLER role
  await ensureSellerRole(input.userId);

  // 7. Update onboarding record with the new brandId + publishedAt
  await updateOnboardingRecord(input.userId, brand.id);

  return { ok: true, brandId: brand.id, brandSlug: brand.slug };
}

async function ensureSellerRole(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "SELLER" && user?.role !== "ADMIN") {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "SELLER" },
    });
  }
}

async function updateOnboardingRecord(userId: number, brandId: number) {
  await prisma.sellerOnboarding.upsert({
    where: { userId },
    create: {
      userId,
      brandId,
      publishedAt: new Date(),
    },
    update: {
      brandId,
      publishedAt: new Date(),
    },
  });
}
