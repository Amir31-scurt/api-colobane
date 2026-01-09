import { prisma } from '../infrastructure/prisma/prismaClient';
import { generateOrderNumber } from '../core/helpers/orderNumberGenerator';

async function backfillOrderNumbers() {
  console.log('Starting to backfill order numbers for existing orders...');

  // Get all orders without orderNumber
  const orders = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM "Order" WHERE "orderNumber" IS NULL
  `;

  console.log(`Found ${orders.length} orders without orderNumber`);

  for (const order of orders) {
    let orderNumber: string;
    let isUnique = false;
    let attempts = 0;

    // Generate a unique order number
    while (!isUnique && attempts < 10) {
      orderNumber = generateOrderNumber();
      
      const existing = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "Order" WHERE "orderNumber" = ${orderNumber}
      `;

      if (Number(existing[0].count) === 0) {
        isUnique = true;
        
        // Update the order with the new orderNumber
        await prisma.$executeRaw`
          UPDATE "Order" SET "orderNumber" = ${orderNumber} WHERE id = ${order.id}
        `;
        
        console.log(`✓ Updated order ${order.id} with orderNumber: ${orderNumber}`);
        break;
      }
      
      attempts++;
    }

    if (!isUnique) {
      // Fallback with timestamp
      const fallbackNumber = `CLB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await prisma.$executeRaw`
        UPDATE "Order" SET "orderNumber" = ${fallbackNumber} WHERE id = ${order.id}
      `;
      console.log(`✓ Updated order ${order.id} with fallback orderNumber: ${fallbackNumber}`);
    }
  }

  console.log('✅ Backfill completed!');
  await prisma.$disconnect();
}

backfillOrderNumbers()
  .catch((error) => {
    console.error('Error during backfill:', error);
    process.exit(1);
  });
