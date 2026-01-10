import { PrismaClient } from '@prisma/client';
// Use local function since we can't depend on types being perfect
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CLB-${dateStr}-${randomChars}`;
}

async function backfillOrderNumbers() {
  console.log('🔄 Starting order number backfill (RAW SQL MODE)...');

  try {
    // 1. Check if column exists first
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' AND column_name = 'orderNumber';
    `;
    
    if (columns.length === 0) {
      console.log('⚠️ Column orderNumber does not exist yet. Migration might have failed or not run.');
      return;
    }

    // 2. Find orders without an order number (using Raw SQL to avoid type errors)
    const orders = await prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id FROM "Order" WHERE "orderNumber" IS NULL
    `;

    console.log(`Found ${orders.length} orders to update.`);

    if (orders.length === 0) {
      console.log('✅ No backfill needed.');
      return;
    }

    // 3. Update each order
    let updated = 0;
    for (const order of orders) {
      const orderNumber = generateOrderNumber();
      
      // Update using raw SQL
      await prisma.$executeRaw`
        UPDATE "Order" 
        SET "orderNumber" = ${orderNumber}
        WHERE id = ${order.id}
      `;
      updated++;
    }

    console.log(`✅ Backfill complete. Updated ${updated} orders.`);
  } catch (error) {
    console.error('❌ Error backfilling:', error);
    // Don't exit with error, just log it. We don't want to crash the deploy if just backfill fails.
  } finally {
    await prisma.$disconnect();
  }
}

backfillOrderNumbers();
