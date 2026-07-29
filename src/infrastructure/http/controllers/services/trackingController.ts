// src/infrastructure/http/controllers/services/trackingController.ts
import type { Request, Response } from "express";
import { prisma } from "../../../prisma/prismaClient";

export async function logSearchController(req: Request, res: Response) {
  try {
    const { searchQuery, selectedZoneId, selectedCategoryId, resultsCount, sessionId } = req.body;
    if (!searchQuery) {
      return res.status(400).json({ error: "MISSING_SEARCH_QUERY" });
    }

    const userId = (req as any).user?.id || null;

    const log = await (prisma as any).serviceSearchLog.create({
      data: {
        searchQuery: String(searchQuery).toLowerCase().trim(),
        selectedZoneId: selectedZoneId ? Number(selectedZoneId) : null,
        selectedCategoryId: selectedCategoryId ? Number(selectedCategoryId) : null,
        resultsCount: Number(resultsCount || 0),
        userId,
        sessionId: sessionId ? String(sessionId) : null,
      },
    });

    return res.status(201).json({ success: true, logId: log.id });
  } catch (err) {
    console.error("[logSearchController]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function logLeadController(req: Request, res: Response) {
  try {
    const { providerId, actionType, sourcePage, sessionId } = req.body;
    if (!providerId || !actionType) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const userId = (req as any).user?.id || null;

    const log = await (prisma as any).serviceLeadLog.create({
      data: {
        providerId: Number(providerId),
        actionType: String(actionType).toUpperCase(), // "CALL" | "WHATSAPP"
        sourcePage: sourcePage ? String(sourcePage) : "UNKNOWN",
        userId,
        sessionId: sessionId ? String(sessionId) : null,
      },
    });

    return res.status(201).json({ success: true, logId: log.id });
  } catch (err) {
    console.error("[logLeadController]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function logFeedbackController(req: Request, res: Response) {
  try {
    const { providerId, rating, status, comment, customerPhone } = req.body;
    if (!providerId || !rating || !status) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const feedback = await (prisma as any).serviceFeedbackLog.create({
      data: {
        providerId: Number(providerId),
        rating: Number(rating),
        status: String(status),
        comment: comment ? String(comment) : null,
        customerPhone: customerPhone ? String(customerPhone) : null,
      },
    });

    return res.status(201).json({ success: true, feedbackId: feedback.id });
  } catch (err) {
    console.error("[logFeedbackController]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}
