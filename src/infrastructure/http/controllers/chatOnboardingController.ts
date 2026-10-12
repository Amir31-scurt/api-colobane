/**
 * chatOnboardingController.ts
 *
 * Handles the conversational seller onboarding assistant.
 *
 * POST /api/ai/chat          — Process a user message
 * GET  /api/ai/chat/state    — Return current onboarding state (for page reload)
 * POST /api/ai/chat/skip-logo — User explicitly skips logo
 * POST /api/ai/chat/dismiss-coachmark — Dismiss a coach-mark by name
 * POST /api/ai/chat/upload-product-image — Store productImageUrl after upload
 */

import { Request, Response } from "express";
import { prisma } from "../../prisma/prismaClient";
import {
  extractFieldsFromMessage,
  generateKoluAnswer,
} from "../../../core/services/geminiExtract";
import {
  detectPhase,
  nextAction,
  computeProgress,
  OnboardingState,
} from "../../../core/usecases/seller/onboardingStateMachine";
import { publishBrandUsecase } from "../../../core/usecases/seller/publishBrandUsecase";
import { sellerCreateProductUsecase } from "../../../core/usecases/seller/sellerCreateProductUsecase";

const MAX_CHAT_MESSAGES = 40;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

// ─── GET /api/ai/chat/state ──────────────────────────────────────────────────

export async function getChatStateController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;
    const record = await getOrCreateOnboarding(userId);
    const state = recordToState(record);
    const phase = detectPhase(state);
    const progress = computeProgress(state);

    return res.json({
      state,
      phase,
      progress,
      chatMessages: record.chatMessages,
      brandSlug: record.brandId
        ? (await prisma.brand.findUnique({ where: { id: record.brandId }, select: { slug: true } }))
            ?.slug
        : null,
      coachMarkBoutiqueShown: record.coachMarkBoutiqueShown,
      coachMarkProductsShown: record.coachMarkProductsShown,
    });
  } catch (err) {
    console.error("[getChatState]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── POST /api/ai/chat ───────────────────────────────────────────────────────

export async function processChatMessageController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;
    const { message } = req.body as { message: string };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "MESSAGE_REQUIRED" });
    }

    let record = await getOrCreateOnboarding(userId);
    const currentState = recordToState(record);
    const phase = detectPhase(currentState);

    // ── Check if message is a direct image event ────────────────────────────
    const logoUrlMatch = message.match(/^\[LOGO_URL:(.+)\]$/);
    const productUrlMatch = message.match(/^\[PRODUCT_IMAGE(?:_URL|_READY)?:(.+)\]$/);
    const isDirectImageEvent = Boolean(logoUrlMatch || productUrlMatch || message === '[PRODUCT_IMAGE_READY]');

    // ── 1. Extract fields from the message (skip Gemini for direct image tokens)
    let extracted: any = {};
    if (!isDirectImageEvent) {
      extracted = await extractFieldsFromMessage(message, currentState);
    }

    // ── 2. Handle "sans logo" / "skip" keywords ──────────────────────────────
    const isSkipLogo =
      /sans\s+logo|pas\s+de\s+logo|skip|ignorer|plus\s+tard|passer/i.test(message);

    // ── 3. Handle "illimité" for stock ───────────────────────────────────────
    const isUnlimited = /illimit[eé]|service|prestation/i.test(message);
    if (isUnlimited && !extracted.productStock && phase === "PRODUCT_INFO") {
      extracted.productStock = 999999;
    }

    // ── 4. Merge extracted fields into record ────────────────────────────────
    const updateData: any = {};

    if (logoUrlMatch) {
      updateData.logoUrl = logoUrlMatch[1];
    } else if (productUrlMatch) {
      updateData.productImageUrl = productUrlMatch[1];
    }

    if (extracted.ownerName && !record.ownerName)
      updateData.ownerName = extracted.ownerName;
    if (extracted.brandName && !record.brandName)
      updateData.brandName = extracted.brandName;
    if (extracted.activity && !record.activity)
      updateData.activity = extracted.activity;
    if (extracted.location && !record.location)
      updateData.location = extracted.location;
    if (extracted.contactPhone && !record.contactPhone)
      updateData.contactPhone = extracted.contactPhone;
    if (extracted.productName && !record.productName)
      updateData.productName = extracted.productName;
    if (extracted.productPrice && !record.productPrice)
      updateData.productPrice = extracted.productPrice;
    if (
      extracted.productStock !== undefined &&
      record.productStock === null
    )
      updateData.productStock = extracted.productStock;

    // ── 5. Category: only set after user confirms ────────────────────────────
    // If we previously asked to confirm a category, check if the user said "oui"
    let suggestedCategoryName: string | undefined;
    const lastMessages = (record.chatMessages as ChatMessage[]).slice(-3);
    // findLast not available in ES2022 — use manual reverse search
    let lastAssistantMsg: ChatMessage | undefined;
    for (let i = lastMessages.length - 1; i >= 0; i--) {
      if (lastMessages[i].role === "assistant") { lastAssistantMsg = lastMessages[i]; break; }
    }

    if (lastAssistantMsg?.content.includes("catégorie")) {
      const isYes = /^(oui|yes|ok|d\'accord|c\'est ça|correct|parfait|bien sûr)/i.test(
        message.trim()
      );
      if (isYes && !record.categorySlug) {
        // Extract category from previous suggestion in chat
        const catMatch = lastAssistantMsg.content.match(/\*\*([^*]+)\*\*/);
        if (catMatch) {
          const slug = await resolveCategorySlug(catMatch[1]);
          if (slug) updateData.categorySlug = slug;
        }
      } else if (!isYes && extracted.suggestedCategoryName) {
        // User corrected — try to resolve the new suggestion
        const slug = await resolveCategorySlug(extracted.suggestedCategoryName);
        if (slug) {
          updateData.categorySlug = slug;
        } else {
          suggestedCategoryName = extracted.suggestedCategoryName;
        }
      }
    } else if (extracted.suggestedCategoryName && !record.categorySlug) {
      // First time category is inferred — ask for confirmation
      const slug = await resolveCategorySlug(extracted.suggestedCategoryName);
      if (slug) {
        suggestedCategoryName = extracted.suggestedCategoryName; // still confirm
      } else {
        suggestedCategoryName = extracted.suggestedCategoryName;
      }
    }

    // ── 6. Apply skip logo ───────────────────────────────────────────────────
    if (isSkipLogo && !record.logoUrl && phase === "STORE_INFO") {
      // Persist a sentinel so the state machine knows logo was intentionally skipped.
      // Leaving it null was a no-op: nextAction() kept asking for the logo forever.
      updateData.logoUrl = "__SKIP__";
    }

    // Persist updated fields
    if (Object.keys(updateData).length > 0) {
      record = await prisma.sellerOnboarding.update({
        where: { userId },
        data: updateData,
      });
    }

    const updatedState = recordToState(record);
    const updatedPhase = detectPhase(updatedState);

    // ── 7. Decide next action ────────────────────────────────────────────────
    let action = nextAction(updatedState, suggestedCategoryName);

    let assistantMessage = action.message;
    let publishedBrandSlug: string | null = null;
    let publishedBrandId: number | null = null;

    // ── 8. Auto-publish brand if ready ──────────────────────────────────────
    if (
      action.type === "READY_TO_PUBLISH" &&
      updatedPhase === "STORE_INFO" &&
      !record.brandId
    ) {
      const publishResult = await publishBrandUsecase({
        userId,
        ownerName: record.ownerName!,
        brandName: record.brandName!,
        activity: record.activity!,
        categorySlug: record.categorySlug!,
        location: record.location!,
        contactPhone: record.contactPhone!,
        logoUrl: record.logoUrl === "__SKIP__" ? undefined : (record.logoUrl ?? undefined),
      });

      if (publishResult.ok) {
        publishedBrandSlug = publishResult.brandSlug;
        publishedBrandId = publishResult.brandId;

        // Refresh record
        record = await prisma.sellerOnboarding.findUnique({ where: { userId } }) as any;
        const publishedState = recordToState(record);
        action = nextAction(publishedState);
        assistantMessage = `🎉 Votre boutique **${record.brandName}** est maintenant en ligne !\n\nLien de partage : [colobane.com/brands/${publishedBrandSlug}](/brands/${publishedBrandSlug})\n\n${action.message}`;
      } else {
        const failResult = publishResult as { ok: false; errors: string[] };
        assistantMessage = `Il manque encore : ${failResult.errors.join(", ")}. Pouvez-vous me les donner ?`;
      }
    }

    // ── 9. Auto-create product if ready ─────────────────────────────────────
    if (
      action.type === "READY_TO_PUBLISH" &&
      (updatedPhase === "PRODUCT_INFO" || (updatedPhase === "STORE_INFO" && record.brandId)) &&
      !record.firstProductId
    ) {
      if (
        record.productName &&
        record.productPrice &&
        record.productStock !== null &&
        record.productImageUrl
      ) {
        // Resolve category for product
        const category = record.categorySlug
          ? await prisma.category.findUnique({ where: { slug: record.categorySlug } })
          : null;

        try {
          const product = await sellerCreateProductUsecase(userId, {
            name: record.productName,
            price: record.productPrice,
            stock: record.productStock ?? 0,
            imageUrl: record.productImageUrl,
            categoryId: category?.id ?? 1, // fallback to first category
          });

          await prisma.sellerOnboarding.update({
            where: { userId },
            data: { firstProductId: product.id },
          });

          record = await prisma.sellerOnboarding.findUnique({ where: { userId } }) as any;
          assistantMessage = `✅ Produit **${record.productName}** publié ! Vos clients peuvent maintenant le voir sur le marketplace.\n\n🎊 Félicitations, votre boutique est complète !`;
        } catch (err: any) {
          console.error("[chatOnboarding] product creation failed:", err);
          assistantMessage = `Une erreur est survenue lors de la création du produit. Réessayez.`;
        }
      }
    }

    // ── 10. Handle logo skip message ─────────────────────────────────────────
    if (isSkipLogo && action.type === "ASK_LOGO") {
      assistantMessage =
        "Pas de souci, vous pourrez ajouter un logo plus tard depuis votre tableau de bord. 👍\n\n" +
        nextAction({ ...updatedState, logoUrl: "SKIP" }).message;
    }

    // ── 10b. Handle conversational questions & post-publish guidance ──────────
    const isQuestionOrGuide =
      updatedPhase === "DONE" ||
      /couleur|personnalis|th[èe]me|template|modifier|vitrine|partag|lien|whatsapp|comment.*(marche|fonctionne)|promo|booster|vendre|attirer|c\'est quoi|guide/i.test(
        message
      ) ||
      (/\?/.test(message) && Object.keys(updateData).length === 0);

    if (
      isQuestionOrGuide &&
      Object.keys(updateData).length === 0 &&
      !isSkipLogo &&
      action.type !== "READY_TO_PUBLISH"
    ) {
      const activeBrandSlug = record.brandId
        ? (
            await prisma.brand.findUnique({
              where: { id: record.brandId },
              select: { slug: true },
            })
          )?.slug
        : null;

      assistantMessage = await generateKoluAnswer(message, {
        ownerName: record.ownerName,
        brandName: record.brandName,
        brandSlug: activeBrandSlug,
        phase: updatedPhase,
        nextStepPrompt: updatedPhase !== "DONE" ? action.message : undefined,
      });

      if (updatedPhase === "DONE") {
        action = { type: "DONE", message: assistantMessage };
      }
    }

    // ── 11. Save messages to chat history ────────────────────────────────────
    const prevMessages = (record.chatMessages as ChatMessage[]) ?? [];
    const userDisplayContent = logoUrlMatch
      ? "🖼️ [Logo envoyé]"
      : productUrlMatch || message === "[PRODUCT_IMAGE_READY]"
      ? "📷 [Photo envoyée]"
      : message;

    const newMessages: ChatMessage[] = [
      ...prevMessages,
      { role: "user" as const, content: userDisplayContent, timestamp: new Date().toISOString() },
      { role: "assistant" as const, content: assistantMessage, timestamp: new Date().toISOString() },
    ].slice(-MAX_CHAT_MESSAGES);

    await prisma.sellerOnboarding.update({
      where: { userId },
      data: { chatMessages: newMessages },
    });

    const finalRecord = await prisma.sellerOnboarding.findUnique({ where: { userId } });
    const finalState = recordToState(finalRecord);
    const progress = computeProgress(finalState);

    return res.json({
      assistantMessage,
      action,
      state: finalState,
      phase: detectPhase(finalState),
      progress,
      publishedBrandSlug,
      publishedBrandId,
    });
  } catch (err) {
    console.error("[processChatMessage]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── POST /api/ai/chat/skip-logo ─────────────────────────────────────────────

export async function skipLogoController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;

    let record = await prisma.sellerOnboarding.findUnique({ where: { userId } });
    if (!record) return res.status(404).json({ error: "NOT_FOUND" });

    // Persist sentinel so nextAction() can advance past the logo question
    if (!record.logoUrl) {
      record = await prisma.sellerOnboarding.update({
        where: { userId },
        data: { logoUrl: "__SKIP__" },
      });
    }

    const state = recordToState(record);
    let action = nextAction(state);
    let assistantMessage = `Pas de souci, vous pourrez ajouter un logo plus tard depuis votre tableau de bord. 👍\n\n${action.message}`;
    let publishedBrandSlug: string | null = null;

    // Auto-publish if all required fields are present
    if (action.type === "READY_TO_PUBLISH" && !record.brandId) {
      const publishResult = await publishBrandUsecase({
        userId,
        ownerName: record.ownerName!,
        brandName: record.brandName!,
        activity: record.activity!,
        categorySlug: record.categorySlug!,
        location: record.location!,
        contactPhone: record.contactPhone!,
        logoUrl: undefined, // logo was skipped
      });

      if (publishResult.ok) {
        publishedBrandSlug = publishResult.brandSlug;
        record = await prisma.sellerOnboarding.findUnique({ where: { userId } }) as any;
        const publishedState = recordToState(record);
        action = nextAction(publishedState);
        assistantMessage = `Pas de souci, vous pourrez ajouter un logo plus tard. 👍\n\n🎉 Votre boutique **${record.brandName}** est maintenant en ligne !\n\nLien de partage : [colobane.com/brands/${publishedBrandSlug}](/brands/${publishedBrandSlug})\n\n${action.message}`;
      } else {
        const failResult = publishResult as { ok: false; errors: string[] };
        assistantMessage = `Il manque encore : ${failResult.errors.join(", ")}. Pouvez-vous me les donner ?`;
      }
    }

    // Save to chat history
    const prevMessages = (record.chatMessages as any[]) ?? [];
    const newMessages = [
      ...prevMessages,
      { role: "user", content: "sans logo", timestamp: new Date().toISOString() },
      { role: "assistant", content: assistantMessage, timestamp: new Date().toISOString() },
    ];
    await prisma.sellerOnboarding.update({
      where: { userId },
      data: { chatMessages: newMessages.slice(-40) },
    });

    return res.json({
      assistantMessage,
      action,
      publishedBrandSlug,
      state: recordToState(record),
    });
  } catch (err) {
    console.error("[skipLogo]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── POST /api/ai/chat/dismiss-coachmark ─────────────────────────────────────

export async function dismissCoachMarkController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;
    const { name } = req.body as { name: "boutique" | "products" };

    if (!["boutique", "products"].includes(name)) {
      return res.status(400).json({ error: "INVALID_COACHMARK_NAME" });
    }

    const field =
      name === "boutique"
        ? { coachMarkBoutiqueShown: true }
        : { coachMarkProductsShown: true };

    await prisma.sellerOnboarding.upsert({
      where: { userId },
      create: { userId, ...field },
      update: field,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("[dismissCoachMark]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── POST /api/ai/chat/product-image ─────────────────────────────────────────

export async function setProductImageController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;
    const { imageUrl } = req.body as { imageUrl: string };

    if (!imageUrl) return res.status(400).json({ error: "IMAGE_URL_REQUIRED" });

    const record = await prisma.sellerOnboarding.upsert({
      where: { userId },
      create: { userId, productImageUrl: imageUrl },
      update: { productImageUrl: imageUrl },
    });

    const state = recordToState(record);
    const action = nextAction(state);
    const progress = computeProgress(state);

    return res.json({ ok: true, action, progress });
  } catch (err) {
    console.error("[setProductImage]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateOnboarding(userId: number) {
  // Check if record already exists
  const existing = await prisma.sellerOnboarding.findUnique({ where: { userId } });
  if (existing) return existing;

  // First time: pre-populate from the user's account so we never ask for their name
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true },
  });

  return prisma.sellerOnboarding.create({
    data: {
      userId,
      ownerName: user?.name ?? null,
      contactPhone: user?.phone ?? null,
    },
  });
}

function recordToState(record: any): OnboardingState {
  if (!record) return {};
  return {
    ownerName: record.ownerName,
    brandName: record.brandName,
    activity: record.activity,
    categorySlug: record.categorySlug,
    location: record.location,
    contactPhone: record.contactPhone,
    logoUrl: record.logoUrl,
    productName: record.productName,
    productPrice: record.productPrice,
    productStock: record.productStock,
    productImageUrl: record.productImageUrl,
    brandId: record.brandId,
    firstProductId: record.firstProductId,
    publishedAt: record.publishedAt,
  };
}

async function resolveCategorySlug(categoryName: string): Promise<string | null> {
  // Direct slug lookup
  const slug = categoryName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const found = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: { contains: slug, mode: "insensitive" } },
        { name: { contains: categoryName, mode: "insensitive" } },
      ],
    },
  });

  return found?.slug ?? null;
}
