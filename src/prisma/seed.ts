// prisma/seed.ts
import { PrismaClient, UserRole, BrandApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting comprehensive seed...");

  // 1. Categories
  console.log("📦 Seeding categories...");
  const categories = [
    // MODE HOMME
    "Homme", "T-shirts Homme", "Chemises Homme", "Jeans Homme", "Pantalons Homme", "Costumes", "Streetwear Homme", "Chaussures Homme", "Accessoires Homme",
    // MODE FEMME
    "Femme", "Robes", "Jupes", "Tops Femme", "Pantalons Femme", "Chaussures Femme", "Sacs", "Bijoux", "Mode Musulmane", "Streetwear Femme",
    // BEAUTÉ
    "Beauté", "Maquillage", "Soins de peau", "Cheveux", "Parfums", "Ongles",
    // HIGH-TECH
    "Électronique", "Smartphones", "Tablettes", "Accessoires téléphones", "Casques & Audio", "Montres Connectées", "Ordinateurs & Accessoires",
    // MAISON
    "Maison", "Décoration", "Cuisine", "Linge de maison", "Rangement", "Meubles",
    // SPORT & LOISIRS
    "Sport", "Fitness", "Football", "Basketball", "Cyclisme",
    // ENFANTS
    "Enfants", "Bébés", "Vêtements Enfants", "Jeux & Jouets",
    // AUTRES
    "Voitures RC", "Gaming", "Accessoires Auto/Moto", "Lifestyle"
  ];

  for (const name of categories) {
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[éèêë]/g, "e").replace(/&/g, "and");
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, isGlobal: true }
    });
  }

  // 2. Users (Customers & Sellers)
  console.log("👤 Seeding users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Admin
  const adminValue = await prisma.user.upsert({
    where: { email: "admin@colobane.com" },
    update: {},
    create: {
      name: "Admin Colobane",
      email: "admin@colobane.com",
      phone: "+221770000000",
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true
    }
  });

  // Sellers
  const sellers = [];
  const sellerNames = ["Fatou Diop", "Moussa Ndiaye", "Awa Fall", "Cheikh Anta", "Mariama Ba"];
  for (let i = 0; i < sellerNames.length; i++) {
    const seller = await prisma.user.upsert({
      where: { email: `seller${i + 1}@colobane.com` },
      update: {},
      create: {
        name: sellerNames[i],
        email: `seller${i + 1}@colobane.com`,
        phone: `+22177100000${i}`,
        password: hashedPassword,
        role: UserRole.SELLER,
        isActive: true,
        emailVerified: true
      }
    });
    sellers.push(seller);
  }

  // Happy Customers (generate ~120)
  // We'll verify count first to avoid duplicates if seed ran before
  const customerCount = await prisma.user.count({ where: { role: UserRole.CUSTOMER } });
  if (customerCount < 100) {
    console.log("   Generating customers...");
    const customerData = [];
    for (let i = 0; i < 125; i++) {
      customerData.push({
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        phone: `+22170000${1000 + i}`,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
        isActive: true, // "Happy" means active
        emailVerified: true,
        createdAt: new Date(Date.now() - Math.random() * 10000000000) // Random date within last year
      });
    }
    // Bulk create for speed
    await prisma.user.createMany({ data: customerData, skipDuplicates: true });
  }

  // 3. Brands
  console.log("🏷️ Seeding brands...");
  const brandNames = [
    { name: "Samsung Senegal", sellerIdx: 0 },
    { name: "Apple", sellerIdx: 0 },
    { name: "Nike", sellerIdx: 1 },
    { name: "Adidas", sellerIdx: 1 },
    { name: "Zara", sellerIdx: 2 },
    { name: "H&M", sellerIdx: 2 },
    { name: "Tecno Mobile", sellerIdx: 0 },
    { name: "Infinix", sellerIdx: 0 },
    { name: "Dakar Mode", sellerIdx: 3 },
    { name: "Teranga Style", sellerIdx: 3 },
    { name: "Wax & Co", sellerIdx: 4 },
    { name: "Bazin Riche", sellerIdx: 4 },
    { name: "L'Artisan", sellerIdx: 4 },
    { name: "Bio Essence", sellerIdx: 2 },
    { name: "Touba Couture", sellerIdx: 3 }
  ];

  const activeBrands = [];
  for (const b of brandNames) {
    const slug = b.name.toLowerCase().replace(/ /g, "-").replace(/'/g, "");
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: { isActive: true, approvalStatus: BrandApprovalStatus.APPROVED },
      create: {
        name: b.name,
        slug,
        description: `Official brand page for ${b.name} on Colobane.`,
        isActive: true,
        approvalStatus: BrandApprovalStatus.APPROVED,
        ownerId: sellers[b.sellerIdx].id
      }
    });
    activeBrands.push(brand);
  }

  // 4. Products
  console.log("🛍️ Seeding products...");
  const productTemplates = [
    { name: "iPhone 15 Pro Max", price: 850000, category: "Smartphones", brand: "Apple" },
    { name: "Samsung Galaxy S24 Ultra", price: 800000, category: "Smartphones", brand: "Samsung Senegal" },
    { name: "AirPods Pro 2", price: 150000, category: "Accessoires téléphones", brand: "Apple" },
    { name: "MacBook Air M2", price: 950000, category: "Ordinateurs & Accessoires", brand: "Apple" },
    { name: "Infinix Hot 40", price: 90000, category: "Smartphones", brand: "Infinix" },
    { name: "Tecno Spark 20", price: 85000, category: "Smartphones", brand: "Tecno Mobile" },
    { name: "Nike Air Force 1", price: 65000, category: "Chaussures Homme", brand: "Nike" },
    { name: "Adidas Stan Smith", price: 55000, category: "Chaussures Homme", brand: "Adidas" },
    { name: "Robe Bazin Riche", price: 45000, category: "Mode Musulmane", brand: "Bazin Riche" },
    { name: "Ensemble Wax", price: 35000, category: "Femme", brand: "Wax & Co" },
    { name: "Sac à main Cuir", price: 25000, category: "Sacs", brand: "L'Artisan" },
    { name: "Costume 3 pièces", price: 120000, category: "Costumes", brand: "Dakar Mode" },
    { name: "Boubou Traditionnel", price: 75000, category: "Mode Musulmane", brand: "Touba Couture" },
    { name: "Montre Connectée Sport", price: 30000, category: "Montres Connectées", brand: "Samsung Senegal" },
    { name: "Crème Hydratante Bio", price: 15000, category: "Soins de peau", brand: "Bio Essence" },
    { name: "Parfum Bois de Oud", price: 40000, category: "Parfums", brand: "Teranga Style" },
    { name: "T-shirt Oversize", price: 10000, category: "T-shirts Homme", brand: "Zara" },
    { name: "Jean Slim Fit", price: 15000, category: "Jeans Homme", brand: "H&M" },
  ];

  for (const t of productTemplates) {
    const slug = t.name.toLowerCase().replace(/ /g, "-").replace(/'/g, "") + "-" + Math.floor(Math.random() * 1000);

    // Find brand ID
    const brand = activeBrands.find(b => b.name === t.brand);
    if (!brand) continue;

    // Find category ID
    const catSlug = t.category.toLowerCase().replace(/ /g, "-").replace(/[éèêë]/g, "e").replace(/&/g, "and");
    const category = await prisma.category.findUnique({ where: { slug: catSlug } });

    if (category) {
      await prisma.product.upsert({
        where: { slug }, // Using slug as unique identifier, adding random number to avoid collision
        update: {},
        create: {
          name: t.name,
          slug,
          description: `Description pour ${t.name}. Authentique et de qualité.`,
          price: t.price,
          stock: 50,
          isActive: true,
          imageUrl: "/images/placeholder-product.png", // Start with placeholder
          brandId: brand.id,
          categories: { connect: { id: category.id } }
        }
      });
    }
  }

  // Duplicate some products to reach higher numbers
  const initialProductCount = await prisma.product.count();
  if (initialProductCount < 50) {
    // simple logic to add more if needed, but for now template is enough for basic stats
    console.log(`   Seeded ${initialProductCount} initial products.`);
  }

  console.log("✅ Comprehensive seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
