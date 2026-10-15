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

    // ── 5. Category resolution — store directly, no verbal confirmation loop ──
    // Root-cause fix: the previous "confirm verbally" approach caused infinite loops
    // because suggestedCategoryName was never persisted between requests.
    // New approach:
    //   a) If Gemini infers a category AND we find a matching slug → store it directly.
    //   b) If no slug found → pass suggestedCategoryName so the state machine asks
    //      the user to clarify (a single explicit ask, not a loop).
    //   c) If the user's current message IS a direct category reply (when the last
    //      assistant message asked for the category), try to extract it from the message.
    let suggestedCategoryName: string | undefined;

    if (!record.categorySlug) {
      // Check if the last assistant message was asking for the category
      const lastMessages = (record.chatMessages as ChatMessage[]).slice(-4);
      let lastAssistantMsg: ChatMessage | undefined;
      for (let i = lastMessages.length - 1; i >= 0; i--) {
        if (lastMessages[i].role === "assistant") { lastAssistantMsg = lastMessages[i]; break; }
      }
      const lastMsgWasCategoryAsk =
        lastAssistantMsg?.content.toLowerCase().includes("catégorie") ||
        lastAssistantMsg?.content.toLowerCase().includes("categorie");

      // Try to get a category from the extracted fields
      const candidateName =
        extracted.suggestedCategoryName ||
        // If user directly replied to a category question, treat the whole message as category hint
        (lastMsgWasCategoryAsk ? message.trim() : undefined);

      if (candidateName) {
        const slug = await resolveCategorySlug(candidateName);
        if (slug) {
          // ✅ Slug found → persist immediately, no verbal confirmation needed
          updateData.categorySlug = slug;
        } else {
          // ❌ No matching slug → let the state machine ask for clarification
          suggestedCategoryName = candidateName;
        }
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


