import { Request, Response } from "express";
import { adminListUsersUsecase } from "../../../../core/usecases/admin/users/adminListUsersUsecase";
import { adminUpdateUserRoleUsecase } from "../../../../core/usecases/admin/users/adminUpdateUserRoleUsecase";
import { adminToggleUserBlockUsecase } from "../../../../core/usecases/admin/users/adminToggleUserBlockUsecase";

export async function adminListUsersController(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize || 20)));
    const q = req.query.q ? String(req.query.q) : undefined;
    const role = req.query.role ? (String(req.query.role) as any) : undefined;

    const data = await adminListUsersUsecase({ page, pageSize, q, role });
    return res.json(data);
  } catch {
    return res.status(400).json({ error: "UNKNOWN" });
  }
}

export async function adminUpdateUserRoleController(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body || {};
    if (!Number.isFinite(userId) || !role) return res.status(400).json({ error: "INVALID_BODY" });

    const updated = await adminUpdateUserRoleUsecase({
      actorId: req.auth!.userId,
      userId,
      role: String(role) as any,
    });

    return res.json(updated);
  } catch (e: any) {
    return res.status(e?.message === "USER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
  }
}

export async function adminToggleUserBlockController(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const { isBlocked } = req.body || {};
    if (!Number.isFinite(userId) || typeof isBlocked !== "boolean") return res.status(400).json({ error: "INVALID_BODY" });

    const updated = await adminToggleUserBlockUsecase({
      actorId: req.auth!.userId,
      userId,
      isBlocked,
    });

    return res.json(updated);
  } catch (e: any) {
    return res.status(e?.message === "USER_NOT_FOUND" ? 404 : 400).json({ error: e?.message || "UNKNOWN" });
  }
}
