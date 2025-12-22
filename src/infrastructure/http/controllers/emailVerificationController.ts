import { Request, Response } from "express";
import { verifyEmailUseCase } from "../../../core/usecases/auth/verifyEmailUsecase";

export async function verifyEmailController(req: Request, res: Response) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Token manquant" });
  }

  await verifyEmailUseCase(token);

  res.json({
    status: "ok",
    message: "Email vérifié avec succès",
  });
}
