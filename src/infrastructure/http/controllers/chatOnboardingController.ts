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
import multer from "multer";
import { prisma } from "../../prisma/prismaClient";
import {
  extractFieldsFromMessage,
  generateKoluAnswer,
  transcribeKoluVoice,
  synthesizeKoluSpeech,
} from "../../../core/services/geminiExtract";
import {
  detectPhase,
  nextAction,
  computeProgress,
  detectWolof,
  OnboardingState,
  KoluLang,
} from "../../../core/usecases/seller/onboardingStateMachine";
import { publishBrandUsecase } from "../../../core/usecases/seller/publishBrandUsecase";
import { sellerCreateProductUsecase } from "../../../core/usecases/seller/sellerCreateProductUsecase";
import { parseSenegalPhone } from "../../../utils/senegalPhone";

const MAX_CHAT_MESSAGES = 40;

const voiceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
export const voiceUploadMiddleware = voiceUpload.single("audio");

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

// ─── Shared Kolu message processor (used by text & voice endpoints) ──────────

async function handleKoluMessage(
  userId: number,
  message: string,
  requestedLang?: KoluLang,
  userDisplayOverride?: string
) {
  let record = await getOrCreateOnboarding(userId);
  const currentState = recordToState(record);
  const phase = detectPhase(currentState);

  const logoUrlMatch = message.match(/^\[LOGO_URL:(.+)\]$/);
  const productUrlMatch = message.match(/^\[PRODUCT_IMAGE(?:_URL|_READY)?:(.+)\]$/);
  const isDirectImageEvent = Boolean(
    logoUrlMatch || productUrlMatch || message === "[PRODUCT_IMAGE_READY]"
  );

  // 1. Extract structured fields (FR + Wolof)
  let extracted: any = {};
  if (!isDirectImageEvent) {
    extracted = await extractFieldsFromMessage(message, currentState);
  }

  // Determine effective language (explicit WO or detected Wolof)
  const lang: KoluLang =
    requestedLang === "wo" || extracted.detectedLang === "wo" || detectWolof(message)
      ? "wo"
      : "fr";
  const isWo = lang === "wo";

  // 2. Skip-logo keywords (FR + Wolof)
  const isSkipLogo =
    /sans\s+logo|pas\s+de\s+logo|skip|ignorer|plus\s+tard|passer|amuma\s+logo|ba\s+beneen|j[aà]llal/i.test(
      message
    );

  // 3. Unlimited stock keywords (FR + Wolof)
  const isUnlimited = /illimit[eé]|service|prestation|du\s+jeex|bari\s+na/i.test(message);
  if (isUnlimited && !extracted.productStock && phase === "PRODUCT_INFO") {
    extracted.productStock = 999999;
  }

  // 4. Merge extracted fields + strict Senegal phone check
  const updateData: any = {};
  let invalidPhoneFeedback: string | null = null;

  if (logoUrlMatch) {
    updateData.logoUrl = logoUrlMatch[1];
  } else if (productUrlMatch) {
    updateData.productImageUrl = productUrlMatch[1];
  }

  if (extracted.ownerName && !record.ownerName) updateData.ownerName = extracted.ownerName;
  if (extracted.brandName && !record.brandName) updateData.brandName = extracted.brandName;
  if (extracted.activity && !record.activity) updateData.activity = extracted.activity;
  if (extracted.location && !record.location) updateData.location = extracted.location;

  if (extracted.contactPhone && !record.contactPhone) {
    const parsedPhone = parseSenegalPhone(extracted.contactPhone);
    if (parsedPhone.valid && parsedPhone.e164) {
      updateData.contactPhone = parsedPhone.e164;
    } else {
      invalidPhoneFeedback = isWo
        ? "Numero bu Sénégal (+221, ex: 77 123 45 67) rekk lañu nangu. Jox ma sa numero WhatsApp bu Sénégal."
        : "Seuls les numéros du Sénégal (+221, ex: 77 123 45 67) sont acceptés. Quel est votre numéro WhatsApp sénégalais ?";
    }
  }

  if (extracted.productName && !record.productName) updateData.productName = extracted.productName;
  if (extracted.productPrice && !record.productPrice)
    updateData.productPrice = extracted.productPrice;
  if (extracted.productStock !== undefined && record.productStock === null)
    updateData.productStock = extracted.productStock;

  // 5. Category resolution
  let suggestedCategoryName: string | undefined;

  if (!record.categorySlug) {
    const lastMessages = (record.chatMessages as ChatMessage[]).slice(-4);
    let lastAssistantMsg: ChatMessage | undefined;
    for (let i = lastMessages.length - 1; i >= 0; i--) {
      if (lastMessages[i].role === "assistant") {
        lastAssistantMsg = lastMessages[i];
        break;
      }
    }
    const lastMsgWasCategoryAsk =
      lastAssistantMsg?.content.toLowerCase().includes("catégorie") ||
      lastAssistantMsg?.content.toLowerCase().includes("categorie") ||
      lastAssistantMsg?.content.toLowerCase().includes("kategori");

    const candidateName =
      extracted.suggestedCategoryName || (lastMsgWasCategoryAsk ? message.trim() : undefined);

    if (candidateName) {
      const slug = await resolveCategorySlug(candidateName);
      if (slug) {
        updateData.categorySlug = slug;
      } else {
        suggestedCategoryName = candidateName;
      }
    }
  }

  // 6. Apply skip logo
  if (isSkipLogo && !record.logoUrl && phase === "STORE_INFO") {
    updateData.logoUrl = "__SKIP__";
  }

  if (Object.keys(updateData).length > 0) {
    record = await prisma.sellerOnboarding.update({
      where: { userId },
      data: updateData,
    });
  }

  const updatedState = recordToState(record);
  const updatedPhase = detectPhase(updatedState);

  // 7. Decide next action
  let action = nextAction(updatedState, suggestedCategoryName, lang);
  let assistantMessage = invalidPhoneFeedback || action.message;
  let publishedBrandSlug: string | null = null;
  let publishedBrandId: number | null = null;

  // 8. Auto-publish brand if ready
  if (
    !invalidPhoneFeedback &&
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

      record = (await prisma.sellerOnboarding.findUnique({ where: { userId } })) as any;
      const publishedState = recordToState(record);
      action = nextAction(publishedState, undefined, lang);
      assistantMessage = isWo
        ? `🎉 Sa butik **${record.brandName}** ubbi na ci internet !\n\nLien bi nga mëna séddoo : [mycolobane.com/brands/${publishedBrandSlug}](/brands/${publishedBrandSlug})\n\n${action.message}`
        : `🎉 Votre boutique **${record.brandName}** est maintenant en ligne !\n\nLien de partage : [mycolobane.com/brands/${publishedBrandSlug}](/brands/${publishedBrandSlug})\n\n${action.message}`;
    } else {
      const failResult = publishResult as { ok: false; errors: string[] };
      assistantMessage = isWo
        ? `Li des ba léegi : ${failResult.errors.join(", ")}. Mën nga ma ko jox ?`
        : `Il manque encore : ${failResult.errors.join(", ")}. Pouvez-vous me les donner ?`;
    }
  }

  // 9. Auto-create product if ready
  if (
    !invalidPhoneFeedback &&
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
      const category = record.categorySlug
        ? await prisma.category.findUnique({ where: { slug: record.categorySlug } })
        : null;

      try {
        const product = await sellerCreateProductUsecase(userId, {
          name: record.productName,
          price: record.productPrice,
          stock: record.productStock ?? 0,
          imageUrl: record.productImageUrl,
          categoryId: category?.id ?? 1,
        });

        await prisma.sellerOnboarding.update({
          where: { userId },
          data: { firstProductId: product.id },
        });

        record = (await prisma.sellerOnboarding.findUnique({ where: { userId } })) as any;
        assistantMessage = isWo
          ? `✅ Marsandiis bi **${record.productName}** duggu na ! Sa kiliyaan yi mën nañu ko gis ci Colobane.\n\n🎊 Jërëjëf, sa butik mat na sëkk !`
          : `✅ Produit **${record.productName}** publié ! Vos clients peuvent maintenant le voir sur le marketplace.\n\n🎊 Félicitations, votre boutique est complète !`;
      } catch (err: any) {
        console.error("[chatOnboarding] product creation failed:", err);
        assistantMessage = isWo
          ? "Njumte am na bi ñuy duggal marsandiis bi. Jéemaatal."
          : "Une erreur est survenue lors de la création du produit. Réessayez.";
      }
    }
  }

  // 10. Handle logo skip message
  if (isSkipLogo && action.type === "ASK_LOGO") {
    assistantMessage = isWo
      ? `Amul solo, mën nga duggal logo bi beneen yoon ci sa tableau de bord. 👍\n\n${nextAction({ ...updatedState, logoUrl: "SKIP" }, undefined, lang).message}`
      : `Pas de souci, vous pourrez ajouter un logo plus tard depuis votre tableau de bord. 👍\n\n${nextAction({ ...updatedState, logoUrl: "SKIP" }, undefined, lang).message}`;
  }

  // 10b. Smart Conversational AI & Seller Copilot (uses live shop + products + history)
  const hasExistingShop = Boolean(record.brandId);
  const noOnboardingFieldAdded = Object.keys(updateData).length === 0 && !isSkipLogo;

  if (
    !invalidPhoneFeedback &&
    action.type !== "READY_TO_PUBLISH" &&
    (updatedPhase === "DONE" || hasExistingShop || noOnboardingFieldAdded)
  ) {
    const [liveBrand, liveUser] = await Promise.all([
      record.brandId
        ? prisma.brand.findUnique({
            where: { id: record.brandId },
            include: {
              location: true,
              products: {
                take: 6,
                orderBy: { createdAt: "desc" },
                select: { name: true, price: true, stock: true },
              },
              _count: { select: { products: true } },
            },
          })
        : null,
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true },
      }),
    ]);

    const prevMsgs = ((record.chatMessages as ChatMessage[]) ?? []).slice(-8);

    assistantMessage = await generateKoluAnswer(message, {
      ownerName: liveUser?.name || record.ownerName,
      userRole: liveUser?.role,
      brandName: liveBrand?.name || record.brandName,
      brandSlug: liveBrand?.slug || null,
      brandDescription: liveBrand?.description || record.activity,
      brandTemplate: liveBrand?.template || null,
      brandIsActive: liveBrand?.isActive,
      brandIsCertified: liveBrand?.isCertified,
      location: liveBrand?.location?.name || record.location,
      contactPhone: liveBrand?.whatsappNumber || liveBrand?.phone || record.contactPhone,
      totalProducts: liveBrand?._count?.products ?? 0,
      productsList: liveBrand?.products ?? [],
      phase: updatedPhase,
      nextStepPrompt: updatedPhase !== "DONE" ? action.message : undefined,
      lang,
      recentMessages: prevMsgs,
    });

    if (updatedPhase === "DONE" || hasExistingShop) {
      action = { type: "DONE", message: assistantMessage };
    }
  }

  // 11. Save messages to chat history
  const prevMessages = (record.chatMessages as ChatMessage[]) ?? [];
  const userDisplayContent =
    userDisplayOverride ||
    (logoUrlMatch
      ? "🖼️ [Logo envoyé]"
      : productUrlMatch || message === "[PRODUCT_IMAGE_READY]"
        ? "📷 [Photo envoyée]"
        : message);

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
  const progress = computeProgress(finalState, lang);

  return {
    assistantMessage,
    action,
    state: finalState,
    phase: detectPhase(finalState),
    progress,
    publishedBrandSlug,
    publishedBrandId,
    lang,
  };
}

// ─── POST /api/ai/chat ───────────────────────────────────────────────────────

export async function processChatMessageController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;
    const { message, lang } = req.body as { message: string; lang?: KoluLang };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "MESSAGE_REQUIRED" });
    }

    const result = await handleKoluMessage(userId, message, lang === "wo" ? "wo" : "fr");
    return res.json(result);
  } catch (err) {
    console.error("[processChatMessage]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

// ─── POST /api/ai/chat/voice ─────────────────────────────────────────────────

export async function processChatVoiceController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;
    const file = (req as any).file as Express.Multer.File | undefined;
    const preferredLang: KoluLang = req.body?.lang === "wo" ? "wo" : "fr";

    if (!file || !file.buffer || file.buffer.length === 0) {
      return res.status(400).json({ error: "AUDIO_REQUIRED", message: "Aucun audio reçu." });
    }

    const { transcript, detectedLang } = await transcribeKoluVoice(
      file.buffer,
      file.mimetype,
      preferredLang
    );

    if (!transcript) {
      return res.status(422).json({
        error: "EMPTY_TRANSCRIPT",
        message:
          preferredLang === "wo"
            ? "Dégguma li nga wax. Jéemaatal wax bu leer."
            : "Je n'ai pas bien entendu votre message vocal. Pouvez-vous réessayer ?",
      });
    }

    const effectiveLang: KoluLang =
      preferredLang === "wo" || detectedLang === "wo" || detectWolof(transcript) ? "wo" : "fr";

    const result = await handleKoluMessage(
      userId,
      transcript,
      effectiveLang,
      `🎤 ${transcript}`
    );

    return res.json({
      transcript,
      detectedLang: effectiveLang,
      ...result,
    });
  } catch (err: any) {
    console.error("[processChatVoice]", err);
    if (err?.message === "GEMINI_API_KEY_MISSING") {
      return res.status(503).json({
        error: "VOICE_UNAVAILABLE",
        message: "La transcription vocale n'est pas configurée sur le serveur.",
      });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "Erreur de traitement vocal." });
  }
}

// ─── POST /api/ai/chat/tts ───────────────────────────────────────────────────

export async function synthesizeChatVoiceController(req: Request, res: Response) {
  try {
    const { text, lang } = req.body as { text?: string; lang?: KoluLang };
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "TEXT_REQUIRED" });
    }

    const effectiveLang: KoluLang =
      lang === "wo" || detectWolof(text) ? "wo" : "fr";
    const wavBuffer = await synthesizeKoluSpeech(text, effectiveLang);

    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", wavBuffer.length.toString());
    res.setHeader("Cache-Control", "no-store");
    return res.send(wavBuffer);
  } catch (err: any) {
    console.error("[synthesizeChatVoice]", err);
    return res.status(500).json({ error: "TTS_ERROR" });
  }
}

// ─── POST /api/ai/chat/skip-logo ─────────────────────────────────────────────

export async function skipLogoController(req: Request, res: Response) {
  try {
    const userId = req.auth!.userId;
    const lang: KoluLang = req.body?.lang === "wo" ? "wo" : "fr";
    const isWo = lang === "wo";

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
    let action = nextAction(state, undefined, lang);
    let assistantMessage = isWo
      ? `Amul solo, mën nga duggal logo bi beneen yoon ci sa tableau de bord. 👍\n\n${action.message}`
      : `Pas de souci, vous pourrez ajouter un logo plus tard depuis votre tableau de bord. 👍\n\n${action.message}`;
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
        record = (await prisma.sellerOnboarding.findUnique({ where: { userId } })) as any;
        const publishedState = recordToState(record);
        action = nextAction(publishedState, undefined, lang);
        assistantMessage = isWo
          ? `Amul solo, mën nga duggal logo bi beneen yoon. 👍\n\n🎉 Sa butik **${record.brandName}** ubbi na ci internet !\n\nLien bi nga mëna séddoo : [mycolobane.com/brands/${publishedBrandSlug}](/brands/${publishedBrandSlug})\n\n${action.message}`
          : `Pas de souci, vous pourrez ajouter un logo plus tard. 👍\n\n🎉 Votre boutique **${record.brandName}** est maintenant en ligne !\n\nLien de partage : [mycolobane.com/brands/${publishedBrandSlug}](/brands/${publishedBrandSlug})\n\n${action.message}`;
      } else {
        const failResult = publishResult as { ok: false; errors: string[] };
        assistantMessage = isWo
          ? `Li des ba léegi : ${failResult.errors.join(", ")}. Mën nga ma ko jox ?`
          : `Il manque encore : ${failResult.errors.join(", ")}. Pouvez-vous me les donner ?`;
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
  const [existing, user, userBrand] = await Promise.all([
    prisma.sellerOnboarding.findUnique({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    }),
    prisma.brand.findFirst({
      where: { ownerId: userId },
      include: {
        location: true,
        categories: true,
        products: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  const firstProduct = userBrand?.products?.[0];

  if (existing) {
    // Sync with real DB Brand & Product if user already created a shop outside Kolu
    const syncData: Record<string, any> = {};
    if (!existing.ownerName && user?.name) syncData.ownerName = user.name;
    if (!existing.contactPhone && (userBrand?.whatsappNumber || userBrand?.phone || user?.phone)) {
      syncData.contactPhone = userBrand?.whatsappNumber || userBrand?.phone || user?.phone;
    }

    if (userBrand) {
      const msgs = Array.isArray(existing.chatMessages) ? (existing.chatMessages as any[]) : [];
      const hasStalePreShopPrompt = msgs.some(
        (m) =>
          m?.role === "assistant" &&
          /qu'est-ce que vous vendez|comment vous appelez-vous|dans quelle cat[ée]gorie|quel sera le nom de votre boutique|lan ngay jaay/i.test(
            String(m?.content || "")
          )
      );

      if (existing.brandId !== userBrand.id || hasStalePreShopPrompt) {
        syncData.brandId = userBrand.id;
        syncData.brandName = userBrand.name;
        syncData.publishedAt = userBrand.createdAt;
        if (!existing.brandId || hasStalePreShopPrompt) {
          syncData.chatMessages = [];
        }
      }
      if (!existing.brandName) syncData.brandName = userBrand.name;
      if (!existing.activity) {
        syncData.activity =
          userBrand.description || userBrand.categories?.[0]?.name || "Commerce général";
      }
      if (!existing.categorySlug) {
        syncData.categorySlug = userBrand.categories?.[0]?.slug || "mode";
      }
      if (!existing.location) {
        syncData.location = userBrand.location?.name || "Dakar";
      }
      if (!existing.logoUrl) {
        syncData.logoUrl = userBrand.logoUrl || "__SKIP__";
      }
      if (!existing.publishedAt) {
        syncData.publishedAt = userBrand.createdAt;
      }
      if (firstProduct && !existing.firstProductId) {
        syncData.firstProductId = firstProduct.id;
        syncData.productName = firstProduct.name;
        syncData.productPrice = firstProduct.price;
        syncData.productStock = firstProduct.stock;
        syncData.productImageUrl = firstProduct.imageUrl;
      }
    }

    if (Object.keys(syncData).length > 0) {
      return prisma.sellerOnboarding.update({
        where: { userId },
        data: syncData,
      });
    }
    return existing;
  }

  // First time: pre-populate from the user's account AND any existing shop
  return prisma.sellerOnboarding.create({
    data: {
      userId,
      ownerName: user?.name ?? null,
      contactPhone: userBrand?.whatsappNumber ?? userBrand?.phone ?? user?.phone ?? null,
      brandId: userBrand?.id ?? null,
      brandName: userBrand?.name ?? null,
      activity: userBrand
        ? userBrand.description || userBrand.categories?.[0]?.name || "Commerce général"
        : null,
      categorySlug: userBrand ? userBrand.categories?.[0]?.slug || "mode" : null,
      location: userBrand ? userBrand.location?.name || "Dakar" : null,
      logoUrl: userBrand ? userBrand.logoUrl || "__SKIP__" : null,
      publishedAt: userBrand ? userBrand.createdAt : null,
      firstProductId: firstProduct?.id ?? null,
      productName: firstProduct?.name ?? null,
      productPrice: firstProduct?.price ?? null,
      productStock: firstProduct?.stock ?? null,
      productImageUrl: firstProduct?.imageUrl ?? null,
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
  // ── Synonym map ────────────────────────────────────────────────────────────
  // Maps informal French/Wolof terms to the exact category SLUG in the DB.
  // Slugs must match exactly what was inserted via categories_insert.sql.
  // Pattern is tested against the full lowercased input (activity description
  // OR raw user message when they reply to a category question).
  const SYNONYM_MAP: Array<{ pattern: RegExp; slug: string }> = [
    // MODE — habits, vêtements, robes, boubou, pagne, chaussures...
    { pattern: /habit|v[eê]tement|fringue|mode|fashion|robe|pantalon|chemise|boubou|pagne|tissu|lingerie|chaussure|sac.*main|accessoire.*mode/i, slug: "mode" },

    // HABITS HOMMES (plus spécifique, testé avant mode si "homme" présent)
    { pattern: /habit.*homme|v[eê]tement.*homme|chemise.*homme|pantalon.*homme|costume|streetwear.*homme/i, slug: "habits-hommes" },

    // HABITS FEMMES
    { pattern: /habit.*femme|v[eê]tement.*femme|robe.*femme|jupe|top.*femme|lingerie.*femme/i, slug: "habits-femmes" },

    // ALIMENTATION — nourriture, restauration, épicerie...
    { pattern: /aliment|manger|nourriture|[eé]picerie|boisson|plat|cuisine|resto|restaurant|thiébou|thieb|yassa|poisson|viande|l[eé]gume|fruit|c[eé]r[eé]ale|jus|snack|pâtisserie/i, slug: "alimentation" },

    // BEAUTÉ — cosmétiques, soins, coiffure...
    { pattern: /beaut[eé]|cosm[eé]tique|parfum|maquillage|soin.*peau|coiffure|ongles|manucure|spa|bien.?[eê]tre|cr[eè]me|lotion|lissage|tresse|perruque/i, slug: "beaute" },

    // ÉLECTRONIQUE — téléphones, informatique, gadgets...
    { pattern: /[eé]lectronique|t[eé]l[eé]phone|portable|smartphone|ordinateur|laptop|tablette|tv|t[eé]l[eé]vision|informatique|gadget|casque|[eé]couteur|chargeur|batterie|montre.*connect/i, slug: "electronique" },

    // MAISON — meubles, décoration, ustensiles...
    { pattern: /maison|d[eé]cor|meuble|mobilier|ustensile|vaisselle|literie|housse|rideau|tapis|lampe|cuisine.*ustensile|linge.*maison|rangement/i, slug: "maison" },

    // SERVICES — prestations à domicile, artisans de service...
    { pattern: /service|prestation|domicile|m[eé]nage|plomberie|[eé]lectricit[eé]|peinture|jardinage|gardien|nettoyage|livraison|entretien|r[eé]paration/i, slug: "services" },

    // ARTISANAT — bijoux, broderie, cuir, sculpture...
    { pattern: /artisan|bijou|bracelet|collier|sculpture|poterie|broderie|teinture|batik|cuir|artisanat|vannerie|tissage/i, slug: "artisanat" },

    // SANTÉ — pharmacie, médecine, soins médicaux...
    { pattern: /sant[eé]|m[eé]decin|pharmacie|m[eé]dicament|clinique|infirmier|dentiste|optique|lunette|soin.*m[eé]dicaux/i, slug: "sante" },

    // ENFANTS & BÉBÉ — jouets, poussettes, vêtements enfants...
    { pattern: /enfant|b[eé]b[eé]|jouet|poussette|biberon|v[eê]tement.*enfant|puericulture|scolaire|cahier|cartable|cr[eè]che/i, slug: "enfants" },

    // SPORT & LOISIRS — fitness, football, vélo...
    { pattern: /sport|fitness|gym|v[eé]lo|football|basket|maillot|[eé]quipement.*sport|musculation|running|jogging/i, slug: "sport" },
  ];

  const lower = categoryName.toLowerCase();

  // 1. Try synonym map — lookup by exact slug (slug is UNIQUE in DB)
  for (const { pattern, slug } of SYNONYM_MAP) {
    if (pattern.test(lower)) {
      const found = await prisma.category.findUnique({ where: { slug } });
      if (found) return found.slug;
      // Slug not yet in DB → continue to next pattern or fallback
    }
  }

  // 2. Direct slug/name lookup in DB (handles Gemini's clean category names like "Mode", "Sport")
  const derivedSlug = categoryName
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // strip accents
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const found = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: derivedSlug },
        { slug: { contains: derivedSlug, mode: "insensitive" } },
        { name: { contains: categoryName, mode: "insensitive" } },
      ],
    },
  });

  return found?.slug ?? null;
}


