import { prisma } from '../infrastructure/prisma/prismaClient';
import { generateOrderNumber } from '../core/helpers/orderNumberGenerator';

async function backfillOrderNumbers() {
  console.log('🔄 Starting order number backfill...');

  // 1. Find orders without an order number
  const orders = await prisma.order.findMany({
    where: {
      orderNumber: null
    },
    select: {
      id: true
    }
  });

  console.log(`Found ${orders.length} orders to update.`);

  // 2. Update each order with a unique number
  let updated = 0;
  for (const order of orders) {
    let orderNumber: string;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      orderNumber = generateOrderNumber();
      const existing = await prisma.order.findUnique({
        where: { orderNumber }
      });
      if (!existing) {
        isUnique = true;
        await prisma.order.update({
          where: { id: order.id },
          data: { orderNumber }
        });
        updated++;
      }
      attempts++;
    }
    
    if (!isUnique) {
      console.warn(`Could not generate unique number for order ${order.id}`);
    }
  }

  console.log(`✅ Backfill complete. Updated ${updated} orders.`);
  await prisma.$disconnect();
}

backfillOrderNumbers()
  .catch((e) => {
    console.error('Error backfilling:', e);
    process.exit(1);
  });
