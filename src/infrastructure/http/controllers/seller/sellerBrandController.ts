import type { Response } from "express";
import { prisma } from "../../../prisma/prismaClient";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { uploadImage } from "../../../files/uploadConfig";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadMiddleware = upload.single("logo");

/**
 * GET /api/brands/seller/me
 * Returns the brand owned by the current user
 */
export async function getMyBrandController(req: AuthRequest, res: Response) {
  try {
    const ownerId = (req as any).auth?.userId;
    if (!ownerId) return res.status(401).json({ error: "Non autorisé" });
    const brand = await prisma.brand.findFirst({
      where: { ownerId },
      include: { categories: true, location: true },
    });

    if (!brand) {
      return res.status(404).json({ error: "Vous n'avez pas encore de boutique." });
    }

    return res.json(brand);
  } catch (err: any) {
    console.error("[getMyBrand]", err);
    return res.status(500).json({ error: "Erreur interne" });
  }
}

/**
 * PATCH /api/brands/seller/me
 * Owner updates their brand: name, description, colors, template, bannerUrl
 */
export async function updateMyBrandController(req: AuthRequest, res: Response) {
  try {
    const ownerId = (req as any).auth?.userId;
    if (!ownerId) return res.status(401).json({ error: "Non autorisé" });
    const brand = await prisma.brand.findFirst({
      where: { ownerId },
    });

    if (!brand) {
      return res.status(404).json({ error: "Vous n'avez pas encore de boutique." });
    }

    const allowed = ["name", "description", "primaryColor", "secondaryColor", "website", "template"];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Logo upload if file attached
    if (req.file) {
      const ext = req.file.originalname.split(".").pop() || "jpg";
      const key = `logos/${brand.id}-${Date.now()}.${ext}`;
      const logoUrl = await uploadImage(req.file.buffer, key, req.file.mimetype);
      updates.logoUrl = logoUrl;
    }

    const updated = await prisma.brand.update({
      where: { id: brand.id },
      data: updates,
    });

    return res.json(updated);
  } catch (err: any) {
    console.error("[updateMyBrand]", err);
    return res.status(500).json({ error: "Erreur interne" });
  }
}
