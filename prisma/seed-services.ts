// prisma/seed-services.ts
// Run this separately: npx ts-node prisma/seed-services.ts
// Or integrate into the main seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌍 Seeding service zones & categories...");

  // ── Zones de Dakar ───────────────────────────────────────────────────────
  const zones = [
    { name: "Plateau / Centre-Ville", slug: "plateau-centre-ville" },
    { name: "Médina",                 slug: "medina" },
    { name: "Grand Dakar / Colobane", slug: "grand-dakar-colobane" },
    { name: "Parcelles Assainies",    slug: "parcelles-assainies" },
    { name: "Pikine",                 slug: "pikine" },
    { name: "Guédiawaye",             slug: "guediawaye" },
    { name: "Keur Massar",            slug: "keur-massar" },
    { name: "Rufisque",               slug: "rufisque" },
    { name: "Yoff",                   slug: "yoff" },
    { name: "Ngor",                   slug: "ngor" },
    { name: "Ouakam",                 slug: "ouakam" },
    { name: "HLM / Liberté",          slug: "hlm-liberte" },
    { name: "Sacré-Cœur / Mermoz",   slug: "sacre-coeur-mermoz" },
  ];

  for (const zone of zones) {
    await prisma.serviceZone.upsert({
      where: { slug: zone.slug },
      update: {},
      create: { ...zone, city: "Dakar" },
    });
  }
  console.log(`✅ ${zones.length} zones créées`);

  // ── Catégories de Services ────────────────────────────────────────────────
  const categories = [
    // Services de la Maison
    { name: "Plomberie",            nameWolof: "Plombier bi",         slug: "plomberie",            emoji: "🔧", sortOrder: 1 },
    { name: "Électricité",          nameWolof: "Electricien bi",      slug: "electricite",           emoji: "⚡", sortOrder: 2 },
    { name: "Menuiserie",           nameWolof: "Menuisier bi",        slug: "menuiserie",            emoji: "🪵", sortOrder: 3 },
    { name: "Maçonnerie",           nameWolof: "Bâtisseur bi",        slug: "maconnerie",            emoji: "🏗️", sortOrder: 4 },
    { name: "Peinture",             nameWolof: "Peintre bi",          slug: "peinture",              emoji: "🎨", sortOrder: 5 },
    { name: "Climatisation",        nameWolof: null,                  slug: "climatisation",         emoji: "❄️", sortOrder: 6 },
    { name: "Jardinage",            nameWolof: null,                  slug: "jardinage",             emoji: "🌿", sortOrder: 7 },
    // Services Personnels
    { name: "Ménage / Nettoyage",   nameWolof: "Ménagère bi",        slug: "menage-nettoyage",      emoji: "🧹", sortOrder: 8 },
    { name: "Coiffure",             nameWolof: "Coiffeur bi",         slug: "coiffure",              emoji: "💇", sortOrder: 9 },
    { name: "Couture / Tailleur",   nameWolof: "Tailleur bi",        slug: "couture-tailleur",      emoji: "🪡", sortOrder: 10 },
    { name: "Traiteur / Cuisinier", nameWolof: "Cuisinier bi",       slug: "traiteur-cuisinier",    emoji: "🧑‍🍳", sortOrder: 11 },
    // Services Éducatifs
    { name: "Cours Particuliers",   nameWolof: null,                  slug: "cours-particuliers",    emoji: "📚", sortOrder: 12 },
    { name: "Cours Coraniques",     nameWolof: null,                  slug: "cours-coraniques",      emoji: "📖", sortOrder: 13 },
    { name: "Cours d'Informatique", nameWolof: null,                  slug: "cours-informatique",    emoji: "💻", sortOrder: 14 },
    // Services Techniques
    { name: "Mécanicien",           nameWolof: "Mecanisien bi",      slug: "mecanicien",            emoji: "🚗", sortOrder: 15 },
    { name: "Réparation Téléphone", nameWolof: null,                  slug: "reparation-telephone",  emoji: "📱", sortOrder: 16 },
    { name: "Sécurité / Caméras",   nameWolof: null,                  slug: "securite-cameras",      emoji: "📷", sortOrder: 17 },
    { name: "Déménagement",         nameWolof: null,                  slug: "demenagement",          emoji: "📦", sortOrder: 18 },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} catégories créées`);

  console.log("🎉 Seed services terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
