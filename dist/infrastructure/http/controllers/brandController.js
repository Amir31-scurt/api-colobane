"use strict";
// src/infrastructure/http/controllers/brandController
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrandController = createBrandController;
exports.listBrandsController = listBrandsController;
exports.getBrandController = getBrandController;
const createBrand_1 = require("../../../core/usecases/brands/createBrand");
const getBrandBySlug_1 = require("../../../core/usecases/brands/getBrandBySlug");
const resendProvider_1 = require("../../email/resendProvider");
const prismaClient_1 = require("../../prisma/prismaClient");
/**
 * Create a new brand (seller application)
 * Available to any authenticated user
 * Brand will be pending admin approval
 */
async function createBrandController(req, res) {
    try {
        const ownerId = req.auth?.userId;
        const { name, slug, description, primaryColor, secondaryColor, logoUrl } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ error: "NAME_AND_SLUG_REQUIRED" });
        }
        // Check if user already has a brand
        const existingBrand = await prismaClient_1.prisma.brand.findFirst({
            where: { ownerId }
        });
        if (existingBrand) {
            return res.status(409).json({
                error: "USER_ALREADY_HAS_BRAND",
                message: "Vous avez déjà une boutique enregistrée.",
                brand: existingBrand
            });
        }
        const brand = await (0, createBrand_1.createBrandUsecase)({
            name,
            slug,
            ownerId,
            description,
            primaryColor,
            secondaryColor,
            logoUrl
        });
        // Get user info for email
        const user = await prismaClient_1.prisma.user.findUnique({
            where: { id: ownerId },
            select: { email: true, name: true }
        });
        // Send confirmation email to applicant
        if (user?.email) {
            try {
                await (0, resendProvider_1.sendEmail)({
                    to: user.email,
                    subject: "Demande reçue - Votre boutique Colobane",
                    html: getSubmissionEmailTemplate(user.name, name)
                });
            }
            catch (emailErr) {
                console.error("[createBrand] Email to user failed:", emailErr);
            }
        }
        // Notify admins about new application
        try {
            await Promise.resolve().then(() => __importStar(require("../../../core/services/notificationService"))).then(m => m.broadcastToAdmins("BRAND_PENDING", "Nouvelle demande de vendeur", `La boutique "${name}" attend votre approbation.`, { brandId: brand.id, brandName: name }));
        }
        catch (e) {
            console.error("Failed to notify admins:", e);
        }
        // Legacy email notification (optional, kept for redundancy)
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            try {
                await (0, resendProvider_1.sendEmail)({
                    to: adminEmail,
                    subject: `🆕 Nouvelle demande de vendeur: ${name}`,
                    html: getAdminNotificationTemplate(user?.name || "Unknown", name, slug)
                });
            }
            catch (emailErr) {
                console.error("[createBrand] Admin notification failed:", emailErr);
            }
        }
        return res.status(201).json({
            message: "Votre demande a été soumise. Vous recevrez un email une fois approuvée.",
            brand
        });
    }
    catch (err) {
        if (err.message === "BRAND_ALREADY_EXISTS") {
            return res.status(409).json({ error: "BRAND_ALREADY_EXISTS", message: "Ce nom de boutique est déjà pris." });
        }
        console.error("[createBrand]", err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
/**
 * List brands - returns only active/approved brands for public
 */
async function listBrandsController(req, res) {
    try {
        // For public, only show active/approved brands
        const brands = await prismaClient_1.prisma.brand.findMany({
            where: {
                isActive: true,
                approvalStatus: "APPROVED"
            },
            include: {
                _count: { select: { products: true } }
            }
        });
        return res.json(brands);
    }
    catch (err) {
        console.error("[listBrands]", err);
        return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
}
async function getBrandController(req, res) {
    try {
        const slug = req.params.slug;
        const brand = await (0, getBrandBySlug_1.getBrandBySlugUsecase)(slug);
        return res.json(brand);
    }
    catch (err) {
        if (err.message === "BRAND_NOT_FOUND") {
            return res.status(404).json({ message: "Marque introuvable." });
        }
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
}
// =====================
// EMAIL TEMPLATES
// =====================
function getSubmissionEmailTemplate(userName, brandName) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; margin: 0;">Demande Reçue ✉️</h1>
      </div>
      
      <p style="font-size: 16px; color: #333;">Bonjour <strong>${userName}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">
        Nous avons bien reçu votre demande pour créer la boutique 
        <strong style="color: #f59e0b;">${brandName}</strong> sur Colobane.
      </p>
      
      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
        <strong>Prochaines étapes :</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Notre équipe va examiner votre demande</li>
          <li>Vous recevrez un email de confirmation sous 24-48h</li>
          <li>Une fois approuvé, vous pourrez commencer à vendre</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Merci de votre confiance !<br/>
        L'équipe Colobane
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        🇸🇳 Colobane - La marketplace du Sénégal
      </p>
    </div>
  `;
}
function getAdminNotificationTemplate(userName, brandName, brandSlug) {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>🆕 Nouvelle Demande de Vendeur</h2>
      
      <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Nom</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${userName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Boutique</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${brandName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Slug</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${brandSlug}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('fr-FR')}</td>
        </tr>
      </table>
      
      <p style="margin-top: 20px;">
        <a href="${process.env.ADMIN_DASHBOARD_URL || 'https://admin.colobane.com'}/dashboard" 
           style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Voir dans le dashboard
        </a>
      </p>
    </div>
  `;
}
