/**
 * onboardingStateMachine.ts
 *
 * Pure decision logic: given the current SellerOnboarding record,
 * determines what is still missing, computes progress, and produces
 * the next question to ask the user.
 *
 * NO database calls. NO AI calls. Fully testable in isolation.
 */

export type OnboardingState = {
  ownerName?: string | null;
  brandName?: string | null;
  activity?: string | null;
  categorySlug?: string | null;
  location?: string | null;
  contactPhone?: string | null;
  logoUrl?: string | null;

  productName?: string | null;
  productPrice?: number | null;
  productStock?: number | null;
  productImageUrl?: string | null;

  brandId?: number | null;
  firstProductId?: number | null;
  publishedAt?: Date | null;
};

export type OnboardingPhase =
  | "STORE_INFO"      // Collecting brand info (pre-publish)
  | "STORE_PUBLISHED" // Store is live, now collecting first product
  | "PRODUCT_INFO"    // Collecting product info (post-publish)
  | "DONE";           // Both store + first product exist

// ─── Required fields per phase ─────────────────────────────────────────────────

const STORE_REQUIRED_FIELDS: Array<keyof OnboardingState> = [
  "ownerName",
  "brandName",
  "activity",
  "categorySlug",
  "location",
  "contactPhone",
];

const PRODUCT_REQUIRED_FIELDS: Array<keyof OnboardingState> = [
  "productName",
  "productPrice",
  "productStock",
  "productImageUrl",
];

// ─── Phase detection ───────────────────────────────────────────────────────────

export function detectPhase(state: OnboardingState): OnboardingPhase {
  if (state.firstProductId) return "DONE";
  if (state.brandId && state.publishedAt) return "PRODUCT_INFO";
  return "STORE_INFO";
}

// ─── Progress computation ──────────────────────────────────────────────────────

export function computeProgress(state: OnboardingState): {
  percent: number;
  missing: string[];
  label: string;
} {
  const allFields = [...STORE_REQUIRED_FIELDS, ...PRODUCT_REQUIRED_FIELDS];
  // Logo is optional — add it as a soft bonus (+5%)
  const LOGO_BONUS = 5;

  const total = allFields.length;
  let filled = 0;
  const missing: string[] = [];

  for (const field of allFields) {
    const val = state[field];
    if (val !== null && val !== undefined && val !== "") {
      filled++;
    } else {
      missing.push(fieldToFrenchLabel(field));
    }
  }

  let percent = Math.round((filled / total) * (100 - LOGO_BONUS));
  if (state.logoUrl) percent += LOGO_BONUS;
  percent = Math.min(percent, 100);

  const label =
    percent === 100
      ? "Tout est prêt !"
      : `${percent}%, il reste : ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`;

  return { percent, missing, label };
}

function fieldToFrenchLabel(field: string): string {
  const map: Record<string, string> = {
    ownerName: "votre prénom",
    brandName: "le nom de la boutique",
    activity: "ce que vous vendez",
    categorySlug: "la catégorie",
    location: "votre localisation",
    contactPhone: "un numéro de contact",
    productName: "le nom du produit",
    productPrice: "le prix",
    productStock: "la quantité disponible",
    productImageUrl: "une photo du produit",
  };
  return map[field] || field;
}

// ─── Next question logic ───────────────────────────────────────────────────────

export type NextAction =
  | { type: "ASK"; message: string }
  | { type: "CONFIRM_CATEGORY"; suggestedCategory: string; message: string }
  | { type: "READY_TO_PUBLISH"; message: string }
  | { type: "ASK_LOGO"; message: string }
  | { type: "ASK_PRODUCT_PHOTO"; message: string }
  | { type: "DONE"; message: string };

/**
 * Returns the next thing the assistant should say or do.
 *
 * @param state      Current onboarding record
 * @param suggestedCategoryName  If AI just inferred a category, pass its display name here
 *                               so the assistant can confirm with the user before writing it.
 */
export function nextAction(
  state: OnboardingState,
  suggestedCategoryName?: string
): NextAction {
  const phase = detectPhase(state);

  // ── Phase: DONE ─────────────────────────────────────────────────────────────
  if (phase === "DONE") {
    return {
      type: "DONE",
      message:
        "🎉 Votre boutique est en ligne et votre premier produit est ajouté ! Partagez votre lien boutique avec vos clients.",
    };
  }

  // ── Phase: PRODUCT_INFO ─────────────────────────────────────────────────────
  if (phase === "PRODUCT_INFO") {
    if (!state.productName) {
      return {
        type: "ASK",
        message:
          "Super, votre boutique est en ligne ! 🛍️ Maintenant ajoutons votre premier produit. Quel est son nom ?",
      };
    }
    if (!state.productPrice) {
      return {
        type: "ASK",
        message: `Quel est le prix de "${state.productName}" en FCFA ?`,
      };
    }
    if (state.productPrice <= 0) {
      return {
        type: "ASK",
        message: "Le prix doit être supérieur à 0 FCFA. Quel est le bon prix ?",
      };
    }
    if (state.productStock === null || state.productStock === undefined) {
      return {
        type: "ASK",
        message: `Combien d'unités de "${state.productName}" avez-vous disponibles ? (ou tapez "illimité" pour un service)`,
      };
    }
    if (!state.productImageUrl) {
      return {
        type: "ASK_PRODUCT_PHOTO",
        message: `Il ne manque plus qu'une photo de "${state.productName}". Envoyez-la et le produit sera en ligne ! 📸`,
      };
    }
    // All product fields present → ready to create product
    return {
      type: "READY_TO_PUBLISH",
      message: `Parfait ! Je vais publier le produit "${state.productName}" maintenant.`,
    };
  }

  // ── Phase: STORE_INFO ───────────────────────────────────────────────────────

  // ownerName is now pre-populated from the user's account — only ask if somehow missing
  if (!state.ownerName) {
    return {
      type: "ASK",
      message:
        "Bonjour ! 👋 Je suis l'assistant Colobane. Comment vous appelez-vous ?",
    };
  }

  // First name for friendly messages
  const firstName = state.ownerName.split(' ')[0];

  if (!state.activity) {
    return {
      type: "ASK",
      message: `Bonjour ${firstName} ! 👋 Qu'est-ce que vous vendez ou proposez comme service ?`,
    };
  }

  if (!state.categorySlug) {
    if (suggestedCategoryName) {
      return {
        type: "CONFIRM_CATEGORY",
        suggestedCategory: suggestedCategoryName,
        message: `D'après ce que vous m'avez dit, je vous placerai dans la catégorie **${suggestedCategoryName}**. C'est correct ? (oui / non + précisez)`,
      };
    }
    return {
      type: "ASK",
      message:
        "Dans quelle catégorie se trouve votre activité ? (ex: Mode, Alimentation, Électronique, Beauté, Services…)",
    };
  }

  if (!state.brandName) {
    const suggestion = suggestBrandName(state.ownerName, state.activity);
    return {
      type: "ASK",
      message: `Quel sera le nom de votre boutique, ${firstName} ? Je suggère **${suggestion}** — gardez-le ou choisissez autre chose.`,
    };
  }

  if (!state.location) {
    return {
      type: "ASK",
      message: "Dans quel quartier ou quelle ville exercez-vous ? (ex: Pikine, Medina, Dakar…)",
    };
  }

  if (!state.contactPhone) {
    return {
      type: "ASK",
      message:
        "Quel numéro WhatsApp vos clients peuvent-ils utiliser pour vous contacter ?",
    };
  }

  // All required store fields present
  if (!state.logoUrl) {
    return {
      type: "ASK_LOGO",
      message:
        `Excellent ! 🎉 Il ne manque plus que votre logo (optionnel). Envoyez une image, ou tapez **"sans logo"** pour continuer maintenant.`,
    };
  }

  return {
    type: "READY_TO_PUBLISH",
    message: `Parfait ! Toutes les infos sont là. Je publie votre boutique **${state.brandName}** maintenant.`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function suggestBrandName(ownerName: string, activity: string): string {
  // Simple heuristic: "Fatou Mode" / "Boutique de Fatou" etc.
  const first = ownerName.split(" ")[0];
  const activityWord = activity.split(" ").slice(0, 2).join(" ");
  return `${first} ${activityWord}`;
}

/** Validates a phone number (Senegalese format) */
export function isValidPhone(phone: string): boolean {
  // Allow +221XXXXXXXXX or 7XXXXXXXX (9 digits) or similar
  return /^(\+221)?[0-9]{9,12}$/.test(phone.replace(/\s/g, ""));
}

/** Validates required store fields */
export function validateStoreFields(state: OnboardingState): string[] {
  const errors: string[] = [];
  for (const field of STORE_REQUIRED_FIELDS) {
    const val = state[field];
    if (val === null || val === undefined || val === "") {
      errors.push(fieldToFrenchLabel(field));
    }
  }
  if (state.contactPhone && !isValidPhone(state.contactPhone)) {
    errors.push("numéro de contact invalide");
  }
  if (!state.categorySlug) {
    errors.push("catégorie non définie");
  }
  return errors;
}
