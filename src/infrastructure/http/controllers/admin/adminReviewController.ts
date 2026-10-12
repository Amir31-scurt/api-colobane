/**
 * adminReviewController.ts
 *
 * Post-publish admin review dashboard.
 * Admins review newly auto-published stores AFTER they go live.
 * No blocking — just flagging for priority review.
 *
 * GET  /admin/brands/live-review   — List recently auto-published brands with suspicion flags
 * POST /admin/brands/:id/flag      — Flag a brand for manual review (no take-down, just flag)
 * POST /admin/brands/:id/suspend   — Suspend a live brand (sets isActive=false, approvalStatus=PENDING)
 */

import { Request, Response } from "express";
import { prisma } from "../../../prisma/prismaClient";

export async function adminLiveReviewController(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
    const flagged = req.query.flagged === "true";

    // Base filter: brands that were auto-published (approvalStatus=APPROVED, isActive=true)
    // and have an onboarding record (created via chat)
    const where: any = {
      approvalStatus: "APPROVED",
      isActive: true,
    };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true, phone: true, role: true } },
          _count: { select: { products: true } },
          categories: { select: { name: true, slug: true } },
        },
        orderBy: { reviewedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.brand.count({ where }),
    ]);

    // Compute suspicion flags for each brand
    const brandsWithFlags = brands.map((brand) => {
      const flags: string[] = [];

      if (!brand.logoUrl) flags.push("Pas de logo");
      if (brand._count.products === 0) flags.push("Aucun produit");
      if (!brand.phone && !brand.whatsappNumber) flags.push("Pas de contact");

      // Check for duplicate names (simple check — same name ignoring case)
      // (We'll add this check below in a second pass if needed)

      return {
        ...brand,
        suspicionFlags: flags,
        flagCount: flags.length,
        isPriorityReview: flags.length >= 2,
      };
    });

    // Sort: priority review first
    brandsWithFlags.sort((a, b) => b.flagCount - a.flagCount);

    return res.json({
      items: brandsWithFlags,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[adminLiveReview]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminSuspendBrandController(req: Request, res: Response) {
  try {
    const brandId = Number(req.params.id);
    const adminId = (req as any).auth?.userId;
    const { reason } = req.body || {};

    if (!Number.isFinite(brandId)) {
      return res.status(400).json({ error: "INVALID_BRAND_ID" });
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { owner: true },
    });

    if (!brand) return res.status(404).json({ error: "BRAND_NOT_FOUND" });

    // Suspend: hide from marketplace, revert to PENDING for re-review
    await prisma.brand.update({
      where: { id: brandId },
      data: {
        isActive: false,
        approvalStatus: "PENDING",
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectedReason: reason ?? "Suspendu pour vérification manuelle.",
      },
    });

    // Downgrade owner back to CUSTOMER
    await prisma.user.update({
      where: { id: brand.ownerId },
      data: { role: "CUSTOMER" },
    });

    return res.json({ ok: true, message: "Brand suspendue et masquée du marketplace." });
  } catch (err) {
    console.error("[adminSuspendBrand]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
