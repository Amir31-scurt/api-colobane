/**
 * geminiExtract.ts
 *
 * Calls Google Gemini to extract structured fields from a free-form French message.
 * Returns only the fields that could be inferred — never fills in guesses for missing data.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export type ExtractedFields = {
  ownerName?: string;
  brandName?: string;
  activity?: string;
  suggestedCategoryName?: string; // Human-readable, to be confirmed before mapping to slug
  location?: string;
  contactPhone?: string;
  productName?: string;
  productPrice?: number;
  productStock?: number;
};

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Extracts structured fields from a conversational French message.
 *
 * @param message     The raw user message
 * @param knownState  Fields already known — guides extraction focus
 */
export async function extractFieldsFromMessage(
  message: string,
  knownState: Partial<Record<keyof ExtractedFields, unknown>> = {}
): Promise<ExtractedFields> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback: basic heuristics if no API key configured
    return extractWithHeuristics(message);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const alreadyKnown = Object.entries(knownState)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k]) => k)
    .join(", ");

  const prompt = `Tu es un assistant qui aide des commerçants sénégalais informels à créer leur boutique en ligne sur Colobane.

L'utilisateur vient d'envoyer ce message : "${message}"

Champs déjà connus (ne pas ré-extraire) : ${alreadyKnown || "aucun"}.

Extrait les informations présentes dans le message. Renvoie UNIQUEMENT un JSON valide avec les clés suivantes (inclure seulement ce qui est clairement présent dans le message) :
- ownerName : prénom ou nom de la personne
- brandName : nom de boutique explicitement donné
- activity : ce qu'ils vendent ou proposent (service ou produit)
- suggestedCategoryName : catégorie de marché déduite de l'activité (Mode, Alimentation, Électronique, Beauté & Bien-être, Maison & Décoration, Services à domicile, Artisanat, Santé, Enfants & Bébé, Sport, Autres)
- location : quartier ou ville mentionné
- contactPhone : numéro de téléphone ou WhatsApp
- productName : nom d'un produit spécifique mentionné
- productPrice : prix en FCFA (nombre entier uniquement)
- productStock : quantité disponible (nombre entier, 999999 si "illimité" ou service)

Règles strictes :
- Ne jamais inventer de données non présentes
- Si une information est ambiguë, ne pas l'inclure
- Renvoie uniquement le JSON, aucun texte autour

JSON:`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from the response (sometimes Gemini adds markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    const parsed = JSON.parse(jsonMatch[0]);

    // Sanitize: ensure types are correct
    return {
      ownerName: typeof parsed.ownerName === "string" ? parsed.ownerName.trim() : undefined,
      brandName: typeof parsed.brandName === "string" ? parsed.brandName.trim() : undefined,
      activity: typeof parsed.activity === "string" ? parsed.activity.trim() : undefined,
      suggestedCategoryName:
        typeof parsed.suggestedCategoryName === "string"
          ? parsed.suggestedCategoryName.trim()
          : undefined,
      location: typeof parsed.location === "string" ? parsed.location.trim() : undefined,
      contactPhone:
        typeof parsed.contactPhone === "string" ? parsed.contactPhone.trim() : undefined,
      productName: typeof parsed.productName === "string" ? parsed.productName.trim() : undefined,
      productPrice:
        typeof parsed.productPrice === "number" && parsed.productPrice > 0
          ? parsed.productPrice
          : undefined,
      productStock:
        typeof parsed.productStock === "number" && parsed.productStock >= 0
          ? parsed.productStock
          : undefined,
    };
  } catch (err) {
    console.error("[geminiExtract] Gemini error:", err);
    return extractWithHeuristics(message);
  }
}

/**
 * Basic heuristic extraction when no Gemini key is configured.
 * Handles the most common Senegalese patterns.
 */
function extractWithHeuristics(message: string): ExtractedFields {
  const result: ExtractedFields = {};

  // Price: match "12000", "12 000", "12.000 fcfa" etc.
  const priceMatch = message.match(/(\d[\d\s.]*)\s*(?:fcfa|f\.?cfa|fr\.?|xof)?/i);
  if (priceMatch) {
    const price = parseInt(priceMatch[1].replace(/[\s.]/g, ""));
    if (price > 0 && price < 10_000_000) result.productPrice = price;
  }

  // Phone: Senegalese numbers
  const phoneMatch = message.match(/(\+?221\s?)?(\d[\d\s]{8,11})/);
  if (phoneMatch) {
    result.contactPhone = phoneMatch[0].replace(/\s/g, "");
  }

  // "illimité" for stock
  if (/illimit[eé]/i.test(message)) {
    result.productStock = 999999;
  }

  return result;
}

/**
 * Generates a helpful, friendly response as Kolu, Colobane's mascot assistant.
 * Used when the user asks questions about managing their store, colors, products, or Colobane in general.
 */
export async function generateKoluAnswer(
  userMessage: string,
  context: {
    ownerName?: string | null;
    brandName?: string | null;
    brandSlug?: string | null;
    phase: string;
    nextStepPrompt?: string;
  }
): Promise<string> {
  const isAddProductQuery = /ajout.*produit|nouveau.*produit|mettre.*article|vendre.*article/i.test(userMessage);
  const isCustomizeQuery = /couleur|personnalis|th[èe]me|logo|banni[èe]re|modifier.*(boutique|store|vitrine)/i.test(userMessage);

  // Fast direct 1-2-3 answers if specific intent is detected or API key is absent
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (isAddProductQuery) {
      return `👋 Salut ${context.ownerName ? context.ownerName : ''} !\n\nPour ajouter un nouveau produit à votre vitrine, suivez ces 3 étapes directes :\n\n1️⃣ Cliquez sur le lien direct : **[Ajouter un Produit](/seller/products)**\n2️⃣ Cliquez sur le bouton **« + Nouveau Produit »** et renseignez le nom, le prix en FCFA, le stock et la catégorie\n3️⃣ Ajoutez la photo de l'article et enregistrez : il est instantanément en ligne sur votre boutique ! 📦✨`;
    }
    if (isCustomizeQuery) {
      return `👋 Salut ${context.ownerName ? context.ownerName : ''} !\n\nPour personnaliser l'apparence de votre boutique, voici les 3 étapes :\n\n1️⃣ Rendez-vous sur votre espace **[Personnaliser ma Boutique](/seller/shop)**\n2️⃣ Choisissez vos couleurs de marque, importez votre logo et votre bannière\n3️⃣ Cliquez sur **« Enregistrer »** pour appliquer votre nouveau style en temps réel ! 🎨🏪`;
    }
    return "Je suis Kolu, votre guide Colobane ! Rendez-vous sur votre espace [Personnalisation](/seller/shop) ou [Gestion des Produits](/seller/products) pour gérer votre boutique. 🏪";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `Tu es Kolu, le guide et assistant officiel de Colobane (marketplace e-commerce au Sénégal pour les commerçants et créateurs locaux).
Ton rôle : orienter et aider les commerçants sénégalais avec clarté, bienveillance et des instructions directes et immédiatement exploitables.

Contexte du vendeur :
- Prénom du commerçant : ${context.ownerName || "Commerçant"}
- Nom de sa boutique : ${context.brandName || "Non défini"}
- Lien boutique : ${context.brandSlug ? `/brands/${context.brandSlug}` : "En cours de création"}
- Phase actuelle : ${context.phase}
${context.nextStepPrompt ? `- Prochaine étape requise : ${context.nextStepPrompt}` : ""}

Liens directs de la plateforme (syntaxe Markdown obligatoire [Texte](/lien)) :
- [Gestion des Produits](/seller/products) : pour ajouter ou gérer les articles, stocks et photos
- [Personnalisation Boutique](/seller/shop) : pour modifier couleurs, logo, bannière
- [Ma Boutique](/brands/${context.brandSlug || ""}) : pour voir sa vitrine publique

Message du vendeur : "${userMessage}"

RÈGLES STRICTES DE RÉPONSE :
1. Si le vendeur demande comment faire une action (ex: "Je veux ajouter un produit", "Modifier mes couleurs", "Comment vendre") :
   - Donne OBLIGATOIREMENT le lien direct cliquable [Nom de l'action](/chemin).
   - Donne TOUJOURS des instructions concrètes étape par étape numérotées 1️⃣, 2️⃣, 3️⃣.
   Exemple pour ajouter un produit :
   1️⃣ Cliquez sur le lien direct **[Gestion des Produits](/seller/products)**
   2️⃣ Cliquez sur le bouton **« + Ajouter un produit »** et entrez le nom, le prix en FCFA et le stock
   3️⃣ Importez la photo et validez pour le publier en direct sur votre vitrine !
2. Reste direct, chaleureux, concis et efficace (pas de blabla inutile).
3. Utilise quelques emojis adaptés (👋, 🏪, 📦, 🎨, 🚀, ✨).
4. Utilise la syntaxe Markdown pour les liens ([texte](/chemin)) et les éléments clés en **gras**.
5. Ne fabrique pas de faux liens en dehors de ceux listés ci-dessus.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("[generateKoluAnswer] error:", err);
    if (isAddProductQuery) {
      return `👋 Salut ${context.ownerName ? context.ownerName : ''} !\n\nPour ajouter un nouveau produit à votre vitrine, suivez ces 3 étapes directes :\n\n1️⃣ Cliquez sur le lien direct : **[Ajouter un Produit](/seller/products)**\n2️⃣ Cliquez sur le bouton **« + Nouveau Produit »** et renseignez le nom, le prix en FCFA, le stock et la catégorie\n3️⃣ Ajoutez la photo de l'article et enregistrez : il est instantanément en ligne sur votre boutique ! 📦✨`;
    }
    return "Je suis Kolu, votre guide Colobane ! Rendez-vous sur votre espace [Personnalisation](/seller/shop) ou [Gestion des Produits](/seller/products) pour gérer votre boutique. 🏪";
  }
}
