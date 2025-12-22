import { Request, Response } from "express";
import { adminLoginUsecase } from "../../../../core/usecases/admin/auth/adminLoginUsecase";
import { adminLogoutUsecase } from "../../../../core/usecases/admin/auth/adminLogoutUsecase";


export async function adminLoginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "INVALID_BODY" });

    const result = await adminLoginUsecase(String(email), String(password));
    return res.json(result);
  } catch (e: any) {
    const code = e?.message || "UNKNOWN";
    const status =
      code === "INVALID_CREDENTIALS" ? 401 :
      code === "USER_BLOCKED" ? 403 :
      code === "FORBIDDEN" ? 403 : 400;

    return res.status(status).json({ error: code });
  }
}

export async function adminLogoutController(req: Request, res: Response) {
  try {
    const actorId = req.auth!.userId;
    const result = await adminLogoutUsecase(actorId);
    return res.json(result);
  } catch {
    return res.status(400).json({ error: "UNKNOWN" });
  }
}
