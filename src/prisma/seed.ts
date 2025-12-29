// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding categories...");

  const categories = [
    // MODE HOMME
    "Homme",
    "T-shirts Homme",
    "Chemises Homme",
    "Jeans Homme",
    "Pantalons Homme",
    "Costumes",
    "Streetwear Homme",
    "Chaussures Homme",
    "Accessoires Homme",

    // MODE FEMME
    "Femme",
    "Robes",
    "Jupes",
    "Tops Femme",
    "Pantalons Femme",
    "Chaussures Femme",
    "Sacs",
    "Bijoux",
    "Mode Musulmane",
    "Streetwear Femme",

    // BEAUTÉ
    "Beauté",
    "Maquillage",
    "Soins de peau",
    "Cheveux",
    "Parfums",
    "Ongles",

    // HIGH-TECH
    "Électronique",
    "Smartphones",
    "Tablettes",
    "Accessoires téléphones",
    "Casques & Audio",
    "Montres Connectées",
    "Ordinateurs & Accessoires",

    // MAISON
    "Maison",
    "Décoration",
    "Cuisine",
    "Linge de maison",
    "Rangement",
    "Meubles",

    // SPORT & LOISIRS
    "Sport",
    "Fitness",
    "Football",
    "Basketball",
    "Cyclisme",

    // ENFANTS
    "Enfants",
    "Bébés",
    "Vêtements Enfants",
    "Jeux & Jouets",

    // AUTRES
    "Voitures RC",
    "Gaming",
    "Accessoires Auto/Moto",
    "Lifestyle"
  ];

  for (const name of categories) {
    const slug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[éèêë]/g, "e");

    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug,
        isGlobal: true
      }
    });
  }

  console.log("✅ Categories seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
