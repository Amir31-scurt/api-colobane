// prisma/fix-missing-services.ts
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function fix() {
  const cats = await p.serviceCategory.findMany({ select: { id: true, slug: true } });
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  const coutureCat = bySlug["couture-tailleur"];
  const menageCat = bySlug["menage-nettoyage"];
  const traiteurCat = bySlug["traiteur-cuisinier"];

  const fatou = await p.serviceProvider.findFirst({ where: { name: { contains: "Fatou" } } });
  const awa = await p.serviceProvider.findFirst({ where: { name: { contains: "Awa" } } });
  const aminata = await p.serviceProvider.findFirst({ where: { name: { contains: "Aminata" } } });

  if (fatou && coutureCat) {
    await p.service.createMany({
      data: [
        { providerId: fatou.id, categoryId: coutureCat.id, name: "Boubou brodé sur mesure", description: "Boubou homme ou femme avec broderies Bazin. Délai 5–7 jours. Je fournis le tissu ou vous amenez le vôtre.", priceType: "NEGOTIABLE", minPrice: 15000, maxPrice: 50000, isActive: true },
        { providerId: fatou.id, categoryId: coutureCat.id, name: "Robe de soirée / tenue de fête", description: "Robe de baptême, mariage, anniversaire. Création unique selon vos souhaits avec ou sans essayage.", priceType: "QUOTE", requiresQuote: true, isActive: true },
        { providerId: fatou.id, categoryId: coutureCat.id, name: "Retouche & réparation vêtements", description: "Ourlet, fermeture éclair, reprise, repassage professionnel. Prix accessibles, service rapide.", priceType: "FIXED", price: 2000, minPrice: 1500, maxPrice: 5000, isActive: true },
      ],
      skipDuplicates: true,
    });
    console.log("✅ Couture services créés pour Fatou");
  }

  if (awa && menageCat) {
    await p.service.createMany({
      data: [
        { providerId: awa.id, categoryId: menageCat.id, name: "Grand ménage maison / appartement", description: "Nettoyage complet de fond en comble : sol, murs, cuisine, salle de bain, vitres. Produits fournis.", priceType: "HOURLY", price: 3000, minPrice: 15000, maxPrice: 80000, isActive: true },
        { providerId: awa.id, categoryId: menageCat.id, name: "Ménage bureaux & entreprises", description: "Nettoyage quotidien ou hebdomadaire de locaux professionnels. Contrat ou ponctuel. Devis gratuit.", priceType: "QUOTE", requiresQuote: true, isActive: true },
      ],
      skipDuplicates: true,
    });
    console.log("✅ Ménage services créés pour Awa");
  }

  if (aminata && traiteurCat) {
    await p.service.createMany({
      data: [
        { providerId: aminata.id, categoryId: traiteurCat.id, name: "Thiéboudienne pour cérémonie", description: "Riz au poisson préparé pour 20 à 200 personnes. Livraison incluse. Commande 48h minimum.", priceType: "FIXED", price: 2500, minPrice: 50000, maxPrice: 500000, isActive: true },
        { providerId: aminata.id, categoryId: traiteurCat.id, name: "Menu complet cérémonie (baptême/mariage)", description: "Thiéb + jus de bissap + thiakry. Vaisselle, service et nettoyage inclus. Devis selon invités.", priceType: "QUOTE", requiresQuote: true, isActive: true },
      ],
      skipDuplicates: true,
    });
    console.log("✅ Traiteur services créés pour Aminata");
  }

  const total = await p.service.count();
  console.log(`\n🎉 Total services en DB: ${total}`);
}

fix().catch(console.error).finally(async () => { await p.$disconnect(); });
