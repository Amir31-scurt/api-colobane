import { Request, Response } from "express";
import { addEmailToUserUseCase } from "../../../core/usecases/users/addEmailToUserUsecase";
export async function addEmailController(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis" });
  }

  await addEmailToUserUseCase(userId, email);

  res.json({
    status: "ok",
    message: "Email ajouté, vérification envoyée",
  });
}
