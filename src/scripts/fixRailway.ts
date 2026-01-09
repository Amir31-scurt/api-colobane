import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function unstickRailway() {
  console.log('🚄 Railway Migration Fixer Starting...');
  const migrationName = '20260109215603_add_order_number';

  try {
    // 1. Check if the failed migration exists
    console.log(`Checking for failed migration: ${migrationName}`);
    const failedMigrations = await prisma.$queryRaw`
      SELECT id, migration_name, finished_at, started_at 
      FROM "_prisma_migrations" 
      WHERE migration_name = ${migrationName}
    `;
    console.log('Found records:', failedMigrations);

    // 2. Delete it!
    // This tells Prisma "Forget you ever tried this, let's start fresh with the new file"
    const deleted = await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = ${migrationName}
    `;
    console.log(`✅ DELETED ${deleted} records. The blockage is removed.`);
    
    // 3. Optional: Check if column exists, just for info
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'Order' AND column_name = 'orderNumber'
        `;
        console.log('Current schema state (orderNumber column):', columns);
    } catch (e) {
        console.log('Could not check schema (ignoring)');
    }

    console.log('🎉 You can now standard deployment should work!');

  } catch (error) {
    console.error('❌ Error during fix:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

unstickRailway();
