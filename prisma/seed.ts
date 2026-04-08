import { PrismaClient, BrandApprovalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database with fresh data to restore functionality...');

  // 1. Clean existing data (in case there's anything left)
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create standard password
  const defaultPassword = await bcrypt.hash('admin@colobane25', 10);

  // 3. Create Users (Admin, Sellers, Standard User)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mycolobane.com',
      name: 'Amir Admin',
      password: defaultPassword,
      role: 'ADMIN',
      phone: '+221707813382',
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: 'seller1@test.com',
      name: 'Vendeur Premium',
      password: defaultPassword,
      role: 'SELLER',
      phone: '+221770000001',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller2@test.com',
      name: 'Vendeur Marche',
      password: defaultPassword,
      role: 'SELLER',
      phone: '+221770000002',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      name: 'Client Colobane',
      password: defaultPassword,
      role: 'USER',
      phone: '+221770000003',
    },
  });

  console.log('Users created.');

  // 4. Create Categories
  const catMode = await prisma.category.create({ data: { name: 'Mode & Beauté', slug: 'mode-beaute' } });
  const catTech = await prisma.category.create({ data: { name: 'High-Tech', slug: 'high-tech' } });
  const catMaison = await prisma.category.create({ data: { name: 'Maison', slug: 'maison' } });

  console.log('Categories created.');

  // 5. Create Brands (with different templates to showcase the new system)
  const brandElegance = await prisma.brand.create({
    data: {
      name: 'Boutique Luxe',
      slug: 'boutique-luxe',
      description: 'Découvrez des collections exclusives.',
      primaryColor: '#000000',
      secondaryColor: '#555555',
      isActive: true,
      approvalStatus: BrandApprovalStatus.APPROVED,
      template: 'ELEGANCE',
      ownerId: seller1.id,
      categories: { connect: [{ id: catMode.id }] }
    }
  });

  const brandMarche = await prisma.brand.create({
    data: {
      name: 'Affaires en Or',
      slug: 'affaires-en-or',
      description: 'Les meilleurs prix du marché tous les jours.',
      primaryColor: '#ea580c',
      secondaryColor: '#ca8a04',
      isActive: true,
      approvalStatus: BrandApprovalStatus.APPROVED,
      template: 'MARCHE',
      ownerId: seller2.id,
      categories: { connect: [{ id: catTech.id }, { id: catMaison.id }] }
    }
  });

  const brandVitrine = await prisma.brand.create({
    data: {
      name: 'Colobane Officiel',
      slug: 'colobane-officiel',
      description: 'Produits certifiés par la plateforme.',
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      isActive: true,
      approvalStatus: BrandApprovalStatus.APPROVED,
      template: 'VITRINE',
      ownerId: adminUser.id,
      categories: { connect: [{ id: catTech.id }] }
    }
  });

  console.log('Brands created.');

  // 6. Create Products
  const productsToAdd = [
    {
      name: 'Montre de Luxe Classique',
      slug: 'montre-luxe-' + Date.now(),
      description: 'Montre haut de gamme pour poignet.',
      price: 150000,
      stock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      brandId: brandElegance.id,
      categoryId: catMode.id,
    },
    {
      name: 'Sac en Cuir Premium',
      slug: 'sac-cuir-' + Date.now(),
      description: 'Sac fait à la main, 100% cuir.',
      price: 65000,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
      brandId: brandElegance.id,
      categoryId: catMode.id,
    },
    {
      name: 'Smartphone Pro Max',
      slug: 'smartphone-promax-' + Date.now(),
      description: 'Le dernier smartphone avec une caméra 108MP.',
      price: 350000,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
      brandId: brandMarche.id,
      categoryId: catTech.id,
    },
    {
      name: 'Casque Audio Sans Fil',
      slug: 'casque-audio-' + Date.now(),
      description: 'Réduction de bruit active et son Dolby.',
      price: 45000,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      brandId: brandVitrine.id,
      categoryId: catTech.id,
    },
    {
      name: 'Chaise de Bureau Ergonomique',
      slug: 'chaise-bureau-' + Date.now(),
      description: 'Soutien lombaire avancé.',
      price: 85000,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
      brandId: brandMarche.id,
      categoryId: catMaison.id,
    }
  ];

  for (const p of productsToAdd) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        brandId: p.brandId,
        categories: { connect: [{ id: p.categoryId }] }
      }
    });
  }

  console.log('Products created.');
  console.log('✅ Database seeded completely!');
  console.log('----------------------------------------------------');
  console.log('Test Accounts (Password: password123)');
  console.log('Admin : admin@colobane.com');
  console.log('Seller: seller1@test.com');
  console.log('Client: customer@test.com');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
