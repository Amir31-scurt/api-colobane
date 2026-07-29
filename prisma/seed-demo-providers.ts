// prisma/seed-demo-providers.ts
// Crée des prestataires et services de démo réalistes pour tester le catalogue
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo providers & services...");

  // ── Récupérer les zones et catégories existantes ─────────────────────────
  const zones = await prisma.serviceZone.findMany();
  const categories = await prisma.serviceCategory.findMany();

  if (zones.length === 0 || categories.length === 0) {
    throw new Error("❌ Lancez d'abord seed-services.ts pour créer les zones et catégories !");
  }

  const zoneBySlug = Object.fromEntries(zones.map((z) => [z.slug, z]));
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const hashedPw = await bcrypt.hash("Demo1234!", 10);

  // ── Données des prestataires ──────────────────────────────────────────────
  const demoProviders = [
    {
      user: {
        name: "Mamadou Diallo",
        phone: "+221771234501",
        email: "mamadou.diallo@demo.sn",
      },
      provider: {
        name: "Mamadou Diallo",
        bio: "Plombier avec 12 ans d'expérience dans la Médina et le Plateau. Intervention rapide, prix justes et travail soigné. Je répare fuites, installations et fosses septiques.",
        type: "INDIVIDUAL" as const,
        phone: "+221771234501",
        whatsappNumber: "+221771234501",
        verificationLevel: "CERTIFIED" as const,
        isVerified: true,
        totalMissions: 87,
        avgRating: 4.8,
        responseTimeMin: 15,
        availableDays: ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"],
        openTime: "08:00",
        closeTime: "18:00",
        respectsPrayerTime: true,
        hasVehicle: false,
        zoneSlug: "medina",
        otherZones: ["plateau-centre-ville", "grand-dakar-colobane"],
      },
      services: [
        {
          catSlug: "plomberie",
          name: "Réparation fuite d'eau",
          description: "Fuite sous évier, robinet qui goutte, tuyau fissuré. Diagnostic et réparation rapide. Je me déplace avec tout le matériel nécessaire.",
          priceType: "FIXED" as const,
          price: 5000,
          minPrice: 3000,
          maxPrice: 15000,
        },
        {
          catSlug: "plomberie",
          name: "Installation robinetterie & WC",
          description: "Installation ou remplacement de robinets, mitigeurs, chasse d'eau, WC. Travail propre et garanti.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
      ],
    },
    {
      user: {
        name: "Fatou Mbaye",
        phone: "+221771234502",
        email: "fatou.mbaye@demo.sn",
      },
      provider: {
        name: "Fatou Mbaye — Couture Créations",
        bio: "Couturière depuis 15 ans à Parcelles Assainies. Je crée des boubous, robes de soirée, tenues de fête sur mesure. Qualité premium, livraison possible.",
        type: "INDIVIDUAL" as const,
        phone: "+221771234502",
        whatsappNumber: "+221771234502",
        verificationLevel: "ID" as const,
        isVerified: true,
        totalMissions: 143,
        avgRating: 4.9,
        responseTimeMin: 30,
        availableDays: ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"],
        openTime: "09:00",
        closeTime: "20:00",
        respectsPrayerTime: true,
        hasVehicle: false,
        zoneSlug: "parcelles-assainies",
        otherZones: ["grand-dakar-colobane"],
      },
      services: [
        {
          catSlug: "couture",
          name: "Boubou brodé sur mesure",
          description: "Boubou homme ou femme avec broderies Bazin ou autres tissus. Délai 5–7 jours. Je fournis le tissu ou vous amenez le vôtre.",
          priceType: "NEGOTIABLE" as const,
          minPrice: 15000,
          maxPrice: 50000,
        },
        {
          catSlug: "couture",
          name: "Robe de soirée / tenue de fête",
          description: "Robe de baptême, mariage, anniversaire. Création unique selon vos souhaits avec ou sans essayage.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
        {
          catSlug: "couture",
          name: "Retouche & réparation vêtements",
          description: "Ourlet, fermeture éclair, reprise, repassage professionnel. Prix accessibles, service rapide.",
          priceType: "FIXED" as const,
          price: 2000,
          minPrice: 1500,
          maxPrice: 5000,
        },
      ],
    },
    {
      user: {
        name: "Ibrahima Sow",
        phone: "+221771234503",
        email: "ibrahima.sow@demo.sn",
      },
      provider: {
        name: "Ibrahima Sow Électricité",
        bio: "Électricien certifié, 8 ans d'expérience. Dépannage, installation tableau électrique, climatisation, groupe électrogène. Intervention dans tout Dakar.",
        type: "INDIVIDUAL" as const,
        phone: "+221771234503",
        whatsappNumber: "+221771234503",
        verificationLevel: "CERTIFIED" as const,
        isVerified: true,
        totalMissions: 54,
        avgRating: 4.7,
        responseTimeMin: 20,
        availableDays: ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"],
        openTime: "07:00",
        closeTime: "19:00",
        respectsPrayerTime: true,
        hasVehicle: true,
        maxRadiusKm: 20,
        zoneSlug: "plateau-centre-ville",
        otherZones: ["medina", "grand-dakar-colobane", "hlm-liberte"],
      },
      services: [
        {
          catSlug: "electricite",
          name: "Dépannage électrique urgent",
          description: "Panne de courant, disjoncteur qui saute, court-circuit. Je me déplace en urgence et rétablis le courant rapidement.",
          priceType: "FIXED" as const,
          price: 8000,
          minPrice: 5000,
          maxPrice: 25000,
        },
        {
          catSlug: "electricite",
          name: "Installation tableau électrique",
          description: "Tableau neuf ou remplacement, mise aux normes, pose de disjoncteurs différentiels. Devis gratuit sur place.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
        {
          catSlug: "climatisation",
          name: "Installation & entretien climatiseur",
          description: "Pose de clim murale, cassette, multi-split. Nettoyage filtre, recharge gaz, réparation. Toutes marques.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
      ],
    },
    {
      user: {
        name: "Awa Ndiaye",
        phone: "+221771234504",
        email: "awa.ndiaye@demo.sn",
      },
      provider: {
        name: "Awa Ndiaye — Ménage Pro",
        bio: "Service de ménage professionnel pour particuliers et bureaux. Équipe sérieuse, produits de qualité fournis. Disponible du lundi au samedi, paiement après service.",
        type: "SMALL_TEAM" as const,
        phone: "+221771234504",
        whatsappNumber: "+221771234504",
        verificationLevel: "PHONE" as const,
        isVerified: true,
        totalMissions: 210,
        avgRating: 4.6,
        responseTimeMin: 60,
        availableDays: ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"],
        openTime: "08:00",
        closeTime: "17:00",
        respectsPrayerTime: false,
        hasVehicle: false,
        zoneSlug: "sacre-coeur-mermoz",
        otherZones: ["plateau-centre-ville", "hlm-liberte"],
      },
      services: [
        {
          catSlug: "menage",
          name: "Grand ménage maison / appartement",
          description: "Nettoyage complet de fond en comble : sol, murs, cuisine, salle de bain, vitres. Produits fournis. Prix selon superficie.",
          priceType: "HOURLY" as const,
          price: 3000,
          minPrice: 15000,
          maxPrice: 80000,
        },
        {
          catSlug: "menage",
          name: "Ménage bureaux & entreprises",
          description: "Nettoyage quotidien ou hebdomadaire de locaux professionnels. Contrat ou ponctuel. Devis gratuit.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
      ],
    },
    {
      user: {
        name: "Ousmane Faye",
        phone: "+221771234505",
        email: "ousmane.faye@demo.sn",
      },
      provider: {
        name: "Prof. Ousmane — Cours Particuliers",
        bio: "Enseignant en mathématiques et physique-chimie, 6e à Terminale. Résultats garantis, méthode personnalisée. Cours à domicile dans Dakar.",
        type: "INDIVIDUAL" as const,
        phone: "+221771234505",
        whatsappNumber: "+221771234505",
        verificationLevel: "ID" as const,
        isVerified: true,
        totalMissions: 32,
        avgRating: 5.0,
        responseTimeMin: 120,
        availableDays: ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"],
        openTime: "16:00",
        closeTime: "21:00",
        respectsPrayerTime: true,
        hasVehicle: false,
        zoneSlug: "grand-dakar-colobane",
        otherZones: ["medina", "hlm-liberte"],
      },
      services: [
        {
          catSlug: "cours-particuliers",
          name: "Cours de maths — 3e & Bac",
          description: "Soutien scolaire et préparation aux examens. Séances d'1h30 à 2h. Progression suivie et rapports hebdomadaires aux parents.",
          priceType: "HOURLY" as const,
          price: 5000,
          minPrice: 5000,
          maxPrice: 8000,
        },
        {
          catSlug: "cours-particuliers",
          name: "Physique-chimie & SVT",
          description: "Cours de sciences pour collège et lycée. Exercices corrigés, fiches de révision, préparation baccalauréat.",
          priceType: "HOURLY" as const,
          price: 5000,
        },
      ],
    },
    {
      user: {
        name: "Cheikh Diop",
        phone: "+221771234506",
        email: "cheikh.diop@demo.sn",
      },
      provider: {
        name: "Cheikh Diop Menuiserie",
        bio: "Menuisier avec 20 ans d'expérience. Portes, fenêtres, meubles sur mesure, placards, cuisines. Bois de qualité, travail précis.",
        type: "INDIVIDUAL" as const,
        phone: "+221771234506",
        whatsappNumber: "+221771234606",
        verificationLevel: "ID" as const,
        isVerified: true,
        totalMissions: 65,
        avgRating: 4.5,
        responseTimeMin: 180,
        availableDays: ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI"],
        openTime: "08:00",
        closeTime: "17:00",
        respectsPrayerTime: true,
        hasVehicle: true,
        maxRadiusKm: 15,
        zoneSlug: "pikine",
        otherZones: ["parcelles-assainies", "grand-dakar-colobane"],
      },
      services: [
        {
          catSlug: "menuiserie",
          name: "Porte en bois sur mesure",
          description: "Fabrication et pose de portes intérieures et extérieures en bois massif ou contreplaqué. Serrures incluses.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
        {
          catSlug: "menuiserie",
          name: "Meuble / placard sur mesure",
          description: "Bibliothèque, armoire, placard de cuisine, dressing. Conception personnalisée selon vos dimensions.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
      ],
    },
    {
      user: {
        name: "Aminata Diallo",
        phone: "+221771234507",
        email: "aminata.diallo@demo.sn",
      },
      provider: {
        name: "Aminata — Traiteur Événements",
        bio: "Traiteur spécialiste des cérémonies sénégalaises : baptêmes, mariages, anniversaires. Thiéboudienne, ceebu yapp, thiébou guinar, maffé. Cuisine 100% maison.",
        type: "SMALL_TEAM" as const,
        phone: "+221771234507",
        whatsappNumber: "+221771234507",
        verificationLevel: "PHONE" as const,
        isVerified: false,
        totalMissions: 28,
        avgRating: 4.7,
        responseTimeMin: 240,
        availableDays: ["VENDREDI", "SAMEDI", "DIMANCHE"],
        openTime: "08:00",
        closeTime: "22:00",
        respectsPrayerTime: true,
        hasVehicle: true,
        maxRadiusKm: 30,
        zoneSlug: "keur-massar",
        otherZones: ["pikine", "guediawaye"],
      },
      services: [
        {
          catSlug: "traiteur",
          name: "Thiéboudienne pour cérémonie",
          description: "Riz au poisson préparé pour 20 à 200 personnes. Livraison incluse. Commande 48h à l'avance minimum.",
          priceType: "FIXED" as const,
          price: 2500, // par personne
          minPrice: 50000,
          maxPrice: 500000,
        },
        {
          catSlug: "traiteur",
          name: "Menu complet cérémonie (baptême/mariage)",
          description: "Thiéb + jus de bissap + thiakry. Tout inclus : vaisselle, service, nettoyage. Devis selon nombre d'invités.",
          priceType: "QUOTE" as const,
          requiresQuote: true,
        },
      ],
    },
    {
      user: {
        name: "Serigne Touba Ndiaye",
        phone: "+221771234508",
        email: "serigne.ndiaye@demo.sn",
      },
      provider: {
        name: "Oustaz Serigne Touba",
        bio: "Enseignant coranique avec 10 ans d'expérience. Cours de Coran pour enfants et adultes : récitation, mémorisation, tajwid. À domicile ou en ligne.",
        type: "INDIVIDUAL" as const,
        phone: "+221771234508",
        whatsappNumber: "+221771234508",
        verificationLevel: "ID" as const,
        isVerified: true,
        totalMissions: 45,
        avgRating: 4.9,
        responseTimeMin: 60,
        availableDays: ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"],
        openTime: "07:00",
        closeTime: "22:00",
        respectsPrayerTime: true,
        hasVehicle: false,
        zoneSlug: "medina",
        otherZones: ["grand-dakar-colobane", "hlm-liberte"],
      },
      services: [
        {
          catSlug: "cours-coraniques",
          name: "Cours de Coran pour enfants",
          description: "Apprentissage de la récitation, des sourates et des règles du tajwid. Cours progressif adapté à l'âge de l'enfant (4 à 15 ans).",
          priceType: "MONTHLY" as any,
          price: 15000,
        },
        {
          catSlug: "cours-coraniques",
          name: "Mémorisation du Coran — adultes",
          description: "Programme de mémorisation (hifz) pour adultes. Séances 1h/jour, plan personnalisé. Aussi disponible en ligne (WhatsApp).",
          priceType: "HOURLY" as const,
          price: 3000,
        },
      ],
    },
  ];

  // ── Insérer en base ───────────────────────────────────────────────────────

  let providersCreated = 0;
  let servicesCreated = 0;

  for (const demo of demoProviders) {
    try {
      // Vérifier si l'utilisateur existe déjà
      let user = await prisma.user.findUnique({ where: { phone: demo.user.phone } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: demo.user.name,
            phone: demo.user.phone,
            email: demo.user.email,
            password: hashedPw,
            role: "CUSTOMER",
            isActive: true,
            phoneVerified: true,
          },
        });
      }

      // Vérifier si un profil provider existe déjà
      const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: user.id } });
      if (existingProvider) {
        console.log(`⏩ Skip ${demo.provider.name} (already exists)`);
        continue;
      }

      const primaryZone = zoneBySlug[demo.provider.zoneSlug];
      if (!primaryZone) {
        console.warn(`⚠️  Zone introuvable: ${demo.provider.zoneSlug}`);
        continue;
      }

      // Créer le provider
      const provider = await prisma.serviceProvider.create({
        data: {
          userId: user.id,
          name: demo.provider.name,
          bio: demo.provider.bio,
          type: demo.provider.type,
          phone: demo.provider.phone,
          whatsappNumber: demo.provider.whatsappNumber,
          verificationLevel: demo.provider.verificationLevel,
          isVerified: demo.provider.isVerified,
          totalMissions: demo.provider.totalMissions,
          avgRating: demo.provider.avgRating,
          responseTimeMin: demo.provider.responseTimeMin,
          availableDays: demo.provider.availableDays,
          openTime: demo.provider.openTime,
          closeTime: demo.provider.closeTime,
          respectsPrayerTime: demo.provider.respectsPrayerTime,
          hasVehicle: demo.provider.hasVehicle,
          maxRadiusKm: (demo.provider as any).maxRadiusKm ?? null,
          primaryZoneId: primaryZone.id,
        },
      });

      // Zones d'intervention (zone principale + secondaires)
      const allZoneSlugs = [demo.provider.zoneSlug, ...(demo.provider.otherZones ?? [])];
      for (const slug of allZoneSlugs) {
        const zone = zoneBySlug[slug];
        if (zone) {
          await prisma.serviceProviderZone.create({
            data: {
              providerId: provider.id,
              zoneId: zone.id,
              isPrimary: slug === demo.provider.zoneSlug,
            },
          });
        }
      }

      // Wallet
      await prisma.providerWallet.create({ data: { providerId: provider.id } });

      providersCreated++;

      // Créer les services
      for (const svc of demo.services) {
        const category = catBySlug[svc.catSlug];
        if (!category) {
          console.warn(`⚠️  Catégorie introuvable: ${svc.catSlug}`);
          continue;
        }

        await prisma.service.create({
          data: {
            providerId: provider.id,
            categoryId: category.id,
            name: svc.name,
            description: svc.description,
            priceType: (svc.priceType === "MONTHLY" ? "FIXED" : svc.priceType) as any,
            price: (svc as any).price ?? null,
            minPrice: (svc as any).minPrice ?? null,
            maxPrice: (svc as any).maxPrice ?? null,
            requiresQuote: (svc as any).requiresQuote ?? false,
            isActive: true,
          },
        });
        servicesCreated++;
      }

      console.log(`✅ ${demo.provider.name} — ${demo.services.length} services`);
    } catch (err) {
      console.error(`❌ Erreur pour ${demo.provider.name}:`, err);
    }
  }

  console.log(`\n🎉 Seed terminé !`);
  console.log(`   👷 ${providersCreated} prestataires créés`);
  console.log(`   🛠️  ${servicesCreated} services créés`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
