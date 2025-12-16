import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.ts";
import { PaymentProvider } from "@prisma/client";
import { createPaymentIntentUsecase } from "../../../core/usecases/payments/createPaymentIntentUsecase.ts";
import { handleWaveWebhookUsecase } from "../../../core/usecases/payments/handleWaveWebhookUsecase.ts";
import { handleOrangeMoneyWebhookUsecase } from "../../../core/usecases/payments/handleOrangeMoneyWebhookUsecase.ts";
import { confirmCashPaymentUsecase } from "../../../core/usecases/payments/confirmCashPaymentUsecase.ts";
import { verifyWaveSignature } from "../../../core/services/providers/waveSignatureService.ts";
import { verifyOrangeMoneySignature } from "../../../core/services/providers/orangeMoneySignature.ts";
import { paymentsQueue } from "../../jobs/queues.ts";

interface WebhookRequest extends Request {
  rawBody?: string;
}
export async function createPaymentIntentController(req: AuthRequest, res: Response) {
  try {
    const { orderId, provider } = req.body;

    const result = await createPaymentIntentUsecase({
      userId: req.user!.id,
      orderId,
      provider
    });

    return res.status(201).json(result);
  } catch (err: any) {
    console.error(err);

    if (err.message === "ORDER_NOT_FOUND_OR_FORBIDDEN") {
      return res.status(404).json({ message: "Commande introuvable ou non autorisée" });
    }

    if (err.message === "ORDER_NOT_PENDING") {
      return res.status(400).json({ message: "La commande n'est plus en statut PENDING" });
    }

    return res.status(500).json({ message: "Erreur interne création paiement" });
  }
}

export async function waveWebhookController(req: Request, res: Response) {
  try {
    const rawBody = (req as any).rawBody as string;
    const signature = req.headers["wave-signature"] as string | undefined;

    if (!verifyWaveSignature(rawBody, signature)) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    await paymentsQueue.add(
      "payments:waveWebhook",
      { rawBody },
      {
        attempts: 10,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false
      }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("WAVE_WEBHOOK_ENQUEUE_ERROR:", err);
    return res.status(500).json({ message: "Webhook enqueue error" });
  }
}

export async function orangeMoneyWebhookController(req: Request, res: Response) {
  try {
    const rawBody = (req as any).rawBody as string;
    const signature = req.headers["x-api-signature"] as string | undefined;

    if (!verifyOrangeMoneySignature(rawBody, signature)) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    await paymentsQueue.add(
      "payments:orangeWebhook",
      { rawBody },
      {
        attempts: 10,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false
      }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("OM_WEBHOOK_ENQUEUE_ERROR:", err);
    return res.status(500).json({ message: "Webhook enqueue error" });
  }
}

export async function confirmCashPaymentController(req: AuthRequest, res: Response) {
  try {
    const orderId = Number(req.params.orderId);
    await confirmCashPaymentUsecase(orderId);
    return res.json({ message: "Paiement cash confirmé et commande marquée comme payée" });
  } catch (err: any) {
    console.error(err);

    if (err.message === "ORDER_NOT_FOUND") {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (err.message === "CASH_PAYMENT_NOT_FOUND") {
      return res.status(400).json({ message: "Aucun paiement cash en attente pour cette commande" });
    }

    return res.status(500).json({ message: "Erreur interne lors de la confirmation cash" });
  }
}
