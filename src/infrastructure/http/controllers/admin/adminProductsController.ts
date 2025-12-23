import { Request, Response } from "express";
import { adminListProductsUsecase } from "../../../../core/usecases/admin/products/adminListProductsUsecase";
import { adminUpdateProductUsecase } from "../../../../core/usecases/admin/products/adminUpdateProductUsecase";
import { adminToggleProductActiveUsecase } from "../../../../core/usecases/admin/products/adminToggleProductActiveUsecase";


export async function adminListProductsController(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 20)));
    const q = req.query.q ? String(req.query.q) : undefined;
    const isActive = req.query.isActive === undefined ? undefined : String(req.query.isActive) === "true";
    const stockStatus = req.query.stockStatus ? String(req.query.stockStatus) as "IN_STOCK" | "OUT_OF_STOCK" : undefined;

    const data = await adminListProductsUsecase({ page, pageSize, q, isActive, stockStatus });
    return res.json(data);
  } catch {
    return res.status(400).json({ error: "UNKNOWN" });
  }
}

export async function adminUpdateProductController(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);
    if (!Number.isFinite(productId)) return res.status(400).json({ error: "INVALID_ID" });

    const { price, stock, name, description, imageUrl } = req.body || {};
    const data: any = {};

    if (price !== undefined) data.price = Number(price);
    if (stock !== undefined) data.stock = Number(stock);
    if (name !== undefined) data.name = String(name);
    if (description !== undefined) data.description = description === null ? null : String(description);
    if (imageUrl !== undefined) data.imageUrl = imageUrl === null ? null : String(imageUrl);

    const updated = await adminUpdateProductUsecase(
      productId,
      data,
    );

    return res.json(updated);
  } catch (e: any) {
    return res.status(e?.message === "PRODUCT_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
  }
}

export async function adminToggleProductActiveController(req: Request, res: Response) {
  try {
    const productId = Number(req.params.id);
    const { isActive } = req.body || {};
    if (!Number.isFinite(productId) || typeof isActive !== "boolean") return res.status(400).json({ error: "INVALID_BODY" });

    const updated = await adminToggleProductActiveUsecase({
      actorId: req.auth!.userId,
      productId,
      isActive,
    });

    return res.json(updated);
  } catch (e: any) {
    return res.status(e?.message === "PRODUCT_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
  }
}
