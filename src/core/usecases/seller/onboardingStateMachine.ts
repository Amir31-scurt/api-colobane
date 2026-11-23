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

export type KoluLang = "fr" | "wo";

export type OnboardingPhase =
  | "STORE_INFO"      // Collecting brand info (pre-publish)
  | "STORE_PUBLISHED" // Store is live, now collecting first product
  | "PRODUCT_INFO"    // Collecting product info (post-publish)
  | "DONE";           // Both store + first product exist

/** Detects if a message is primarily written or spoken in Wolof / Franc-Wolof */
export function detectWolof(text?: string | null): boolean {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return /\b(nanga\s*def|na\s*nga\s*def|mangi\s*fi|maa\s*ngi|dama\s*begg|dama\s*jaay|sama\s*butik|sama\s*numero|jerejef|baax\s*na|waaw|deedeet|amuma|jallal|ba\s*beneen|du\s*jeex|bari\s*na|ndakaaru|tudd\s*naa|lan\s*la|naka\s*nga|yere|jaay\s*kat|njeg|ubbi\s*butik|defar\s*butik)\b/i.test(
    normalized
  );
}

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

export function computeProgress(
  state: OnboardingState,
  lang: KoluLang = "fr"
): {
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
      missing.push(lang === "wo" ? fieldToWolofLabel(field) : fieldToFrenchLabel(field));
    }
  }

  let percent = Math.round((filled / total) * (100 - LOGO_BONUS));
  if (state.logoUrl) percent += LOGO_BONUS;
  percent = Math.min(percent, 100);

  const label =
    percent === 100
      ? lang === "wo"
        ? "Lépp pare na !"
        : "Tout est prêt !"
      : lang === "wo"
        ? `${percent}%, li des : ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`
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

function fieldToWolofLabel(field: string): string {
  const map: Record<string, string> = {
    ownerName: "sa tur",
    brandName: "turu butik bi",
    activity: "li ngay jaay",
    categorySlug: "kategori bi",
    location: "sa gox",
    contactPhone: "sa numero WhatsApp",
    productName: "turu marsandiis bi",
    productPrice: "njëg gi",
    productStock: "limu marsandiis bi",
    productImageUrl: "foto marsandiis bi",
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
  suggestedCategoryName?: string,
  lang: KoluLang = "fr"
): NextAction {
  const phase = detectPhase(state);
  const isWo = lang === "wo";

  // ── Phase: DONE ─────────────────────────────────────────────────────────────
  if (phase === "DONE") {
    return {
      type: "DONE",
      message: isWo
        ? "🎉 Sa butik ubbi na ci internet te sa njëkk marsandiis duggu na ! Séddoo sa lien ci WhatsApp ak sa kiliyaan yi."
        : "🎉 Votre boutique est en ligne et votre premier produit est ajouté ! Partagez votre lien boutique avec vos clients.",
    };
  }

  // ── Phase: PRODUCT_INFO ─────────────────────────────────────────────────────
  if (phase === "PRODUCT_INFO") {
    if (!state.productName) {
      return {
        type: "ASK",
        message: isWo
          ? "Baax na lool, sa butik ubbi na ! 🛍️ Léegi nanu duggal sa njëkk marsandiis. Naka la tudd ?"
          : "Super, votre boutique est en ligne ! 🛍️ Maintenant ajoutons votre premier produit. Quel est son nom ?",
      };
    }
    if (!state.productPrice) {
      return {
        type: "ASK",
        message: isWo
          ? `Ñaata FCFA ngay jaay "${state.productName}" ?`
          : `Quel est le prix de "${state.productName}" en FCFA ?`,
      };
    }
    if (state.productPrice <= 0) {
      return {
        type: "ASK",
        message: isWo
          ? "Njëg gi war na ëpp 0 FCFA. Ñaata la ci dëgg-dëgg ?"
          : "Le prix doit être supérieur à 0 FCFA. Quel est le bon prix ?",
      };
    }
    if (state.productStock === null || state.productStock === undefined) {
      return {
        type: "ASK",
        message: isWo
          ? `Ñaata pice ci "${state.productName}" nga am ci stock ? (walla bindal "du jeex" su dee servis la)`
          : `Combien d'unités de "${state.productName}" avez-vous disponibles ? (ou tapez "illimité" pour un service)`,
      };
    }
    if (!state.productImageUrl) {
      return {
        type: "ASK_PRODUCT_PHOTO",
        message: isWo
          ? `Foto bi rekk moo des ci "${state.productName}". Yónneel ma foto bi ngir ñu duggal ko ci butik bi ! 📸`
          : `Il ne manque plus qu'une photo de "${state.productName}". Envoyez-la et le produit sera en ligne ! 📸`,
      };
    }
    return {
      type: "READY_TO_PUBLISH",
      message: isWo
        ? `Baax na ! Maa ngi duggal "${state.productName}" ci sa butik léegi.`
        : `Parfait ! Je vais publier le produit "${state.productName}" maintenant.`,
    };
  }

  // ── Phase: STORE_INFO ───────────────────────────────────────────────────────

  if (!state.ownerName) {
    return {
      type: "ASK",
      message: isWo
        ? "Salaam aleekum ! 👋 Man la Kolu, sa ndimbal ci Colobane. Naka nga tudd ?"
        : "Bonjour ! 👋 Je suis l'assistant Colobane. Comment vous appelez-vous ?",
    };
  }

  const firstName = state.ownerName.split(" ")[0];

  if (!state.activity) {
    return {
      type: "ASK",
      message: isWo
        ? `Salaam ${firstName} ! 👋 Lan ngay jaay walla lan moy sa liggéey ?`
        : `Bonjour ${firstName} ! 👋 Qu'est-ce que vous vendez ou proposez comme service ?`,
    };
  }

  if (!state.categorySlug) {
    if (suggestedCategoryName) {
      return {
        type: "CONFIRM_CATEGORY",
        suggestedCategory: suggestedCategoryName,
        message: isWo
          ? `Ci li nga ma wax, dinaa la duggal ci kategori **${suggestedCategoryName}**. Ndax baax na ? (waaw / déedéet + waxal ma)`
          : `D'après ce que vous m'avez dit, je vous placerai dans la catégorie **${suggestedCategoryName}**. C'est correct ? (oui / non + précisez)`,
      };
    }
    return {
      type: "ASK",
      message: isWo
        ? "Ci ban kategori la sa jaay bokk ? (ex: Mode, Électronique, Beauté, Alimentation, Services…)"
        : "Dans quelle catégorie se trouve votre activité ? (ex: Mode, Alimentation, Électronique, Beauté, Services…)",
    };
  }

  if (!state.brandName) {
    const suggestion = suggestBrandName(state.ownerName, state.activity);
    return {
      type: "ASK",
      message: isWo
        ? `Lan nga bëgg tudd sa butik, ${firstName} ? Man maa ngi la di jox **${suggestion}** — mën nga ko jël walla nga tànn beneen tur.`
        : `Quel sera le nom de votre boutique, ${firstName} ? Je suggère **${suggestion}** — gardez-le ou choisissez autre chose.`,
    };
  }

  if (!state.location) {
    return {
      type: "ASK",
      message: isWo
        ? "Ci ban gox walla dëkk nga nekk ? (ex: Parcelles, Pikine, Médina, Dakar…)"
        : "Dans quel quartier ou quelle ville exercez-vous ? (ex: Pikine, Medina, Dakar…)",
    };
  }

  if (!state.contactPhone) {
    return {
      type: "ASK",
      message: isWo
        ? "Ban numero WhatsApp (Sénégal +221) la sa kiliyaan yi mëna jokkoo ak yaw ?"
        : "Quel numéro WhatsApp (+221) vos clients peuvent-ils utiliser pour vous contacter ?",
    };
  }

  if (!state.logoUrl) {
    return {
      type: "ASK_LOGO",
      message: isWo
        ? `Jërëjëf ! 🎉 Logo bi rekk moo des (du lu war). Yónneel ma logo bi, walla bindal **"amuma logo"** ngir ñu jàll léegi.`
        : `Excellent ! 🎉 Il ne manque plus que votre logo (optionnel). Envoyez une image, ou tapez **"sans logo"** pour continuer maintenant.`,
    };
  }

  return {
    type: "READY_TO_PUBLISH",
    message: isWo
      ? `Baax na lool ! Lépp mat na. Maa ngi ubbi sa butik **${state.brandName}** léegi.`
      : `Parfait ! Toutes les infos sont là. Je publie votre boutique **${state.brandName}** maintenant.`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function suggestBrandName(ownerName: string, activity: string): string {
  // Simple heuristic: "Fatou Mode" / "Boutique de Fatou" etc.
  const first = ownerName.split(" ")[0];
  const activityWord = activity.split(" ").slice(0, 2).join(" ");
  return `${first} ${activityWord}`;
}

/** Validates a phone number (Senegalese format only: +221 + 9 digits) */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.trim().replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+") && !cleaned.startsWith("+221")) return false;
  if (cleaned.startsWith("00") && !cleaned.startsWith("00221")) return false;
  const local = cleaned.startsWith("+221")
    ? cleaned.slice(4)
    : cleaned.startsWith("00221")
      ? cleaned.slice(5)
      : cleaned.length === 12 && cleaned.startsWith("221")
        ? cleaned.slice(3)
        : cleaned;
  return /^(?:7[015678]|3[03])\d{7}$/.test(local);
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
