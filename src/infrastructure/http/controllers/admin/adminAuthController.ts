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
  // Client side just drops cookie/token
  return res.json({ success: true });
}

export async function getAdminMeController(req: Request, res: Response) {
  try {
    const actor = req.auth;
    if (!actor) return res.status(401).json({ error: "UNAUTHORIZED" });

    // Fetch fresh data from DB
    const { prisma } = await import("../../../prisma/prismaClient");
    const user = await prisma.user.findUnique({
      where: { id: actor.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });

    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    return res.json(user);
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }
}
