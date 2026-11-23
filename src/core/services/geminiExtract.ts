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
  detectedLang?: "fr" | "wo";
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

  const prompt = `Tu es Kolu, un assistant bilingue (Français et Wolof / Franc-Wolof dakarois) qui aide des commerçants sénégalais à créer leur boutique en ligne sur Colobane.

L'utilisateur vient d'envoyer ce message (peut être en français, en wolof ou un mélange des deux) : "${message}"

Champs déjà connus (ne pas ré-extraire) : ${alreadyKnown || "aucun"}.

Extrait les informations présentes dans le message. Renvoie UNIQUEMENT un JSON valide avec les clés suivantes (inclure seulement ce qui est clairement présent dans le message) :
- ownerName : prénom ou nom de la personne (ex: "Maa ngi tudd Fatou" -> "Fatou")
- brandName : nom de boutique explicitement donné (ex: "Sama butik tudd na Dakar Style" -> "Dakar Style")
- activity : ce qu'ils vendent ou proposent, reformulé clairement en français si donné en wolof (ex: "yéré ak dall" -> "vêtements et chaussures")
- suggestedCategoryName : catégorie de marché déduite de l'activité (Mode, Alimentation, Électronique, Beauté & Bien-être, Maison & Décoration, Services à domicile, Artisanat, Santé, Enfants & Bébé, Sport, Autres)
- location : quartier ou ville mentionné (ex: Parcelles Assainies, Pikine, Médina, Dakar, Thiès…)
- contactPhone : numéro de téléphone ou WhatsApp mentionné
- productName : nom d'un produit spécifique mentionné
- productPrice : prix en FCFA (nombre entier uniquement; en wolof "ñaari junni" = 2000, "juróomi junni" = 5000, "fukki junni" = 10000, "ñaar-fukki junni" = 20000, "temeer" = 100, "junni" = 1000)
- productStock : quantité disponible (nombre entier, 999999 si "illimité", "du jeex", "bari na" ou service)
- detectedLang : "wo" si le message contient du wolof significatif, sinon "fr"

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
      detectedLang: parsed.detectedLang === "wo" ? "wo" : "fr",
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

  // "illimité" / Wolof "du jeex" / "bari na" for stock
  if (/illimit[eé]|du\s+jeex|bari\s+na/i.test(message)) {
    result.productStock = 999999;
  }

  return result;
}

/**
 * Transcribes a voice note (French, Wolof, or Dakar Franc-Wolof) using Gemini 2.5 Flash native audio.
 */
export async function transcribeKoluVoice(
  audioBuffer: Buffer,
  mimeType: string,
  preferredLang: "fr" | "wo" = "fr"
): Promise<{ transcript: string; detectedLang: "fr" | "wo" }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const cleanMime = (mimeType || "audio/webm").split(";")[0].trim();
  const base64Audio = audioBuffer.toString("base64");

  const prompt = `Tu es un transcripteur audio expert pour le Sénégal (Français du Sénégal, Wolof et Franc-Wolof).
Langue préférée de l'utilisateur : ${preferredLang === "wo" ? "Wolof" : "Français"}.

Transcris exactement ce que dit la personne dans cette note vocale (noms de boutiques, quartiers de Dakar, prix en FCFA, numéros de téléphone sénégalais).
Renvoie UNIQUEMENT un JSON valide au format :
{"transcript": "texte exact transcrit", "detectedLang": "wo" ou "fr"}

Règles :
- Si l'audio est silencieux ou incompréhensible, renvoie {"transcript": "", "detectedLang": "${preferredLang}"}.
- Ne mets aucun texte autour du JSON.`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: cleanMime,
        data: base64Audio,
      },
    },
  ]);

  const raw = result.response.text().trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      transcript: typeof parsed.transcript === "string" ? parsed.transcript.trim() : "",
      detectedLang: parsed.detectedLang === "wo" ? "wo" : "fr",
    };
  }

  return { transcript: raw.replace(/^["']|["']$/g, "").trim(), detectedLang: preferredLang };
}

export interface KoluLiveContext {
  ownerName?: string | null;
  userRole?: string | null;
  brandName?: string | null;
  brandSlug?: string | null;
  brandDescription?: string | null;
  brandTemplate?: string | null;
  brandIsActive?: boolean;
  brandIsCertified?: boolean;
  location?: string | null;
  contactPhone?: string | null;
  totalProducts?: number;
  productsList?: Array<{ name: string; price: number; stock: number }>;
  phase: string;
  nextStepPrompt?: string;
  lang?: "fr" | "wo";
  recentMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Generates a context-aware, intelligent conversational response as Kolu (French & Wolof).
 */
export async function generateKoluAnswer(
  userMessage: string,
  context: KoluLiveContext
): Promise<string> {
  const isWo = context.lang === "wo";
  const hasShop = Boolean(context.brandName || context.brandSlug);
  const isAddProductQuery = /ajout.*produit|nouveau.*produit|mettre.*article|vendre.*article|duggal.*marsandiis|jaay.*lu\s+bees/i.test(userMessage);
  const isCustomizeQuery = /couleur|personnalis|th[èe]me|logo|banni[èe]re|modifier.*(boutique|store|vitrine)|soppi.*(butik|kulëer|logo)/i.test(userMessage);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (isWo) {
      if (isAddProductQuery) {
        return `👋 Salaam ${context.ownerName || ""} !\n\nNgir duggal marsandiis bu bees ci sa butik, defal 3 jéego yii :\n\n1️⃣ Bësal fii : **[Duggal Marsandiis](/seller/products)**\n2️⃣ Bësal **« + Nouveau Produit »** nga bind tur bi, njëg gi ci FCFA ak stock bi\n3️⃣ Yónnee foto bi nga enregistree : dina feeñ ci sa butik léegi ! 📦✨`;
      }
      if (isCustomizeQuery) {
        return `👋 Salaam ${context.ownerName || ""} !\n\nNgir soppi melokaani sa butik :\n\n1️⃣ Demal fii : **[Soppi sama Butik](/seller/shop)**\n2️⃣ Tànnal sa kulëer yi, sa modèle vitrine ak sa logo\n3️⃣ Bësal **« Enregistrer »** ! 🎨🏪`;
      }
      return "Man la Kolu, sa ndimbal ci Colobane ! Demal ci [Sama Butik](/seller/shop) walla [Sama Marsandiis](/seller/products) ngir saytu sa liggéey. 🏪";
    }
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

  const langInstruction = isWo
    ? `LANGUE OBLIGATOIRE : Réponds en **WOLOF naturel, fluide et chaleureux du Sénégal** (le wolof parlé à Dakar, en gardant les termes commerciaux courants comme "Wave", "Orange Money", "WhatsApp", "FCFA", "statut").`
    : `LANGUE : Réponds en **FRANÇAIS** naturel, intelligent et chaleureux adapté au Sénégal (sauf si le message de l'utilisateur est en Wolof, auquel cas réponds-lui directement en Wolof).`;

  const productsSummary =
    context.productsList && context.productsList.length > 0
      ? context.productsList
          .map((p) => `• ${p.name} (${p.price.toLocaleString("fr-FR")} FCFA, stock: ${p.stock})`)
          .join("\n")
      : "Aucun produit publié pour le moment.";

  const historyBlock =
    context.recentMessages && context.recentMessages.length > 0
      ? context.recentMessages
          .slice(-8)
          .map((m) => `${m.role === "user" ? "Utilisateur" : "Kolu"}: ${m.content}`)
          .join("\n")
      : "Début de la conversation.";

  const shopContextBlock = hasShop
    ? `STATUT DU COMPTE : Ce commerçant POSSÈDE DÉJÀ une boutique sur Colobane !
- Nom de la boutique : **${context.brandName}**
- Lien public : /brands/${context.brandSlug || ""} (https://mycolobane.com/brands/${context.brandSlug || ""})
- Statut : ${context.brandIsActive ? "En ligne et active" : "Créée (en attente/configuration)"}${context.brandIsCertified ? " (Boutique Certifiée Colobane)" : ""}
- Modèle de vitrine actuel : ${context.brandTemplate || "MODERN"}
- Quartier / Ville : ${context.location || "Dakar"}
- WhatsApp / Téléphone : ${context.contactPhone || "Non renseigné"}
- Description : ${context.brandDescription || "Non renseignée"}
- Nombre total de produits : ${context.totalProducts ?? 0}
- Aperçu de ses produits actuels :
${productsSummary}

⚠️ TRÈS IMPORTANT : Comme ce commerçant a DÉJÀ sa boutique "${context.brandName}", NE LUI DEMANDE JAMAIS de créer une boutique ni "qu'est-ce que vous vendez comme service ?". Tu connais déjà sa boutique et ses produits ! Agis comme son copilote e-commerce personnel : réponds intelligemment à toutes ses questions, rédige-lui des textes publicitaires WhatsApp/TikTok sur mesure avec ses vrais produits et son vrai lien mycolobane.com/brands/${context.brandSlug || ""}, conseille-le pour vendre plus au Sénégal, ou guide-le vers ses outils.`
    : `STATUT DU COMPTE : Cet utilisateur n'a pas encore finalisé sa boutique.
- Prénom : ${context.ownerName || "Utilisateur"}
- Phase d'onboarding : ${context.phase}
${context.nextStepPrompt ? `- Information manquante si l'utilisateur souhaite créer sa boutique : ${context.nextStepPrompt}` : ""}
Note : Si l'utilisateur discute librement, pose une question générale ou salue, réponds-lui naturellement et intelligemment comme un vrai assistant IA, puis propose-lui avec souplesse de continuer la création de sa boutique.`;

  const prompt = `Tu es **Kolu**, l'assistant IA intelligent et copilote e-commerce officiel de **Colobane** (la marketplace des boutiques locales au Sénégal, intégrée avec WhatsApp, Wave et Orange Money).
Tu n'es PAS un robot rigide : tu es un conseiller brillant, chaleureux, cultivé sur le commerce au Sénégal (Dakar, statuts WhatsApp, Wave, Orange Money, livraison tiak-tiak) et capable de tenir une vraie conversation naturelle.

${langInstruction}

=== CONTEXTE EN DIRECT DE L'UTILISATEUR ===
- Nom : ${context.ownerName || "Commerçant"} (Rôle : ${context.userRole || "USER"})
${shopContextBlock}

=== HISTORIQUE RÉCENT DE LA CONVERSATION ===
${historyBlock}

=== LIENS INTERNES COLOBANE (utilise la syntaxe Markdown [Texte](/chemin) quand c'est utile) ===
- [Gérer mes Produits](/seller/products) : ajouter/modifier des articles, prix FCFA, photos et stocks
- [Personnaliser ma Boutique](/seller/shop) : changer de modèle de vitrine (Moderne, Élégance, Vitrine, Marché, Express, Street), couleurs, logo, WhatsApp
${context.brandSlug ? `- [Voir ma Vitrine Publique](/brands/${context.brandSlug}) : voir la boutique telle que les clients la voient` : "- [Ouvrir ma Boutique](/become-seller) : formulaire de création rapide"}
- [Explorer le Catalogue](/products) : voir les produits du marché Colobane

=== NOUVEAU MESSAGE DE L'UTILISATEUR ===
"${userMessage}"

CONSIGNES DE QUALITÉ (IMPÉRATIF — SOIS BREF) :
1. **Réponses COURTES et percutantes** : maximum **2 à 4 phrases courtes** (~40 à 70 mots max), sauf si l'utilisateur demande explicitement un texte complet (ex: un post WhatsApp prêt à copier — même là, reste court et efficace, sans hashtags inutiles).
2. Réponds directement à la question en tenant compte de sa boutique (${context.brandName || "sa boutique"}) et de ses vrais produits.
3. Pour une manipulation sur Colobane, donne 2-3 étapes ultra-courtes (1️⃣, 2️⃣, 3️⃣) avec le lien Markdown [Texte](/chemin).
4. Zéro blabla d'introduction ("Ah excellente question !", "En tant que ton copilote..."). Va droit au but.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("[generateKoluAnswer] error:", err);
    if (isWo) {
      return "Man la Kolu, sa ndimbal ci Colobane ! Demal ci [Sama Butik](/seller/shop) walla [Sama Marsandiis](/seller/products) ngir saytu sa liggéey. 🏪";
    }
    if (isAddProductQuery) {
      return `👋 Salut ${context.ownerName ? context.ownerName : ''} !\n\nPour ajouter un nouveau produit à votre vitrine, suivez ces 3 étapes directes :\n\n1️⃣ Cliquez sur le lien direct : **[Ajouter un Produit](/seller/products)**\n2️⃣ Cliquez sur le bouton **« + Nouveau Produit »** et renseignez le nom, le prix en FCFA, le stock et la catégorie\n3️⃣ Ajoutez la photo de l'article et enregistrez : il est instantanément en ligne sur votre boutique ! 📦✨`;
    }
    return "Je suis Kolu, votre guide Colobane ! Rendez-vous sur votre espace [Personnalisation](/seller/shop) ou [Gestion des Produits](/seller/products) pour gérer votre boutique. 🏪";
  }
}

function pcm24kToWav(pcmBuffer: Buffer): Buffer {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

function cleanTextForTts(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_`~#>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

/**
 * Synthesizes natural Senegalese French or Wolof speech using Gemini Native TTS.
 * Returns a standard WAV buffer playable in any browser <audio> tag.
 */
export async function synthesizeKoluSpeech(
  text: string,
  lang: "fr" | "wo" = "fr"
): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const clean = cleanTextForTts(text);
  if (!clean) {
    throw new Error("EMPTY_TTS_TEXT");
  }

  const spokenPrompt =
    lang === "wo"
      ? `Lis ce texte à haute voix avec une prononciation naturelle sénégalaise en wolof (voyelles claires : "ë" comme "eu", "ñ" comme "gn", "j" comme "dj", "x" comme "kh", "u" comme "ou") et un ton chaleureux : "${clean}"`
      : `Lis ce texte à haute voix en français naturel et chaleureux : "${clean}"`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: spokenPrompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Orus" },
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`TTS_API_ERROR_${res.status}: ${errText.slice(0, 120)}`);
  }

  const data = (await res.json()) as any;
  const inline = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!inline?.data) {
    throw new Error("TTS_NO_AUDIO");
  }

  const pcmBuffer = Buffer.from(inline.data, "base64");
  return pcm24kToWav(pcmBuffer);
}
