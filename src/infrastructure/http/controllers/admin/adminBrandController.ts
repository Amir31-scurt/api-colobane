// src/infrastructure/http/controllers/admin/adminBrandController.ts
import { Request, Response } from "express";
import { prisma } from "../../../prisma/prismaClient";
import { sendEmail } from "../../../email/resendProvider";

/**
 * List all brands for admin (with pagination and filtering)
 */
export async function listAllBrandsController(req: Request, res: Response) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));
        const status = req.query.status as string | undefined;
        const q = req.query.q as string | undefined;

        const where: any = {};

        // Filter by approval status
        if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            where.approvalStatus = status;
        }

        // Search by name or slug
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
                { owner: { name: { contains: q, mode: 'insensitive' } } }
            ];
        }

        const [brands, total] = await Promise.all([
            prisma.brand.findMany({
                where,
                include: {
                    owner: {
                        select: { id: true, name: true, email: true, phone: true, role: true }
                    },
                    _count: { select: { products: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            prisma.brand.count({ where })
        ]);

        return res.json({
            items: brands,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err: any) {
        console.error("[listAllBrands]", err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

/**
 * List all brands pending approval
 */
export async function listPendingBrandsController(req: Request, res: Response) {
    try {
        const brands = await prisma.brand.findMany({
            where: { approvalStatus: "PENDING" },
            include: {
                owner: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            },
            orderBy: { submittedAt: "asc" }
        });

        return res.json({ items: brands, total: brands.length });
    } catch (err: any) {
        console.error("[listPendingBrands]", err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

/**
 * Approve a brand and promote owner to SELLER role
 */
export async function approveBrandController(req: Request, res: Response) {
    try {
        const brandId = Number(req.params.brandId);
        const adminId = (req as any).auth?.userId;

        if (!Number.isFinite(brandId)) {
            return res.status(400).json({ error: "INVALID_BRAND_ID" });
        }

        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            include: { owner: true }
        });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        if (brand.approvalStatus !== "PENDING") {
            return res.status(400).json({ error: "BRAND_ALREADY_REVIEWED" });
        }

        // Update brand to approved
        const updatedBrand = await prisma.brand.update({
            where: { id: brandId },
            data: {
                approvalStatus: "APPROVED",
                isActive: true,
                reviewedAt: new Date(),
                reviewedBy: adminId
            }
        });

        // Promote owner to SELLER role
        await prisma.user.update({
            where: { id: brand.ownerId },
            data: { role: "SELLER" }
        });

        // Send approval email
        if (brand.owner.email) {
            try {
                await sendEmail({
                    to: brand.owner.email,
                    subject: "🎉 Votre boutique a été approuvée - Colobane",
                    html: getApprovalEmailTemplate(brand.owner.name, brand.name)
                });
            } catch (emailErr) {
                console.error("[approveBrand] Email failed:", emailErr);
                // Don't fail the request if email fails
            }
        }

        return res.json({
            message: "Brand approved and seller activated",
            brand: updatedBrand
        });
    } catch (err: any) {
        console.error("[approveBrand]", err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

/**
 * Reject a brand application
 */
export async function rejectBrandController(req: Request, res: Response) {
    try {
        const brandId = Number(req.params.brandId);
        const adminId = (req as any).auth?.userId;
        const { reason } = req.body || {};

        if (!Number.isFinite(brandId)) {
            return res.status(400).json({ error: "INVALID_BRAND_ID" });
        }

        const brand = await prisma.brand.findUnique({
            where: { id: brandId },
            include: { owner: true }
        });

        if (!brand) {
            return res.status(404).json({ error: "BRAND_NOT_FOUND" });
        }

        if (brand.approvalStatus !== "PENDING") {
            return res.status(400).json({ error: "BRAND_ALREADY_REVIEWED" });
        }

        // Update brand to rejected
        const updatedBrand = await prisma.brand.update({
            where: { id: brandId },
            data: {
                approvalStatus: "REJECTED",
                isActive: false,
                reviewedAt: new Date(),
                reviewedBy: adminId,
                rejectedReason: reason || "Votre demande n'a pas été approuvée."
            }
        });

        // Send rejection email
        if (brand.owner.email) {
            try {
                await sendEmail({
                    to: brand.owner.email,
                    subject: "Mise à jour de votre demande - Colobane",
                    html: getRejectionEmailTemplate(brand.owner.name, brand.name, reason)
                });
            } catch (emailErr) {
                console.error("[rejectBrand] Email failed:", emailErr);
            }
        }

        return res.json({
            message: "Brand rejected",
            brand: updatedBrand
        });
    } catch (err: any) {
        console.error("[rejectBrand]", err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}

// =====================
// EMAIL TEMPLATES
// =====================

function getApprovalEmailTemplate(userName: string, brandName: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0;">🎉 Félicitations !</h1>
      </div>
      
      <p style="font-size: 16px; color: #333;">Bonjour <strong>${userName}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">
        Nous avons le plaisir de vous informer que votre boutique 
        <strong style="color: #f59e0b;">${brandName}</strong> a été approuvée !
      </p>
      
      <p style="font-size: 16px; color: #333;">
        Vous pouvez maintenant :
      </p>
      
      <ul style="font-size: 16px; color: #333;">
        <li>Ajouter vos produits</li>
        <li>Gérer votre inventaire</li>
        <li>Commencer à vendre sur Colobane</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.SELLER_DASHBOARD_URL || 'https://admin.colobane.com/seller'}" 
           style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Accéder à mon tableau de bord
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Bienvenue dans la famille Colobane !<br/>
        L'équipe Colobane
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        🇸🇳 Colobane - La marketplace du Sénégal
      </p>
    </div>
  `;
}

function getRejectionEmailTemplate(userName: string, brandName: string, reason?: string): string {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 16px; color: #333;">Bonjour <strong>${userName}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">
        Nous avons examiné votre demande pour la boutique 
        <strong>${brandName}</strong>.
      </p>
      
      <p style="font-size: 16px; color: #333;">
        Malheureusement, nous ne pouvons pas approuver votre demande pour le moment.
      </p>
      
      ${reason ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <strong>Raison :</strong> ${reason}
        </div>
      ` : ''}
      
      <p style="font-size: 16px; color: #333;">
        Vous pouvez soumettre une nouvelle demande après avoir corrigé les points mentionnés.
      </p>
      
      <p style="font-size: 16px; color: #333;">
        Si vous avez des questions, n'hésitez pas à nous contacter.
      </p>
      
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Cordialement,<br/>
        L'équipe Colobane
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        🇸🇳 Colobane - La marketplace du Sénégal
      </p>
    </div>
  `;
}
