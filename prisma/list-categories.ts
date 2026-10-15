import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const cats = await p.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } });
  cats.forEach(c => console.log(`${c.id} | ${c.slug} | ${c.name}`));
  console.log(`\nTotal: ${cats.length} categories`);
}
main().finally(() => p.$disconnect());
