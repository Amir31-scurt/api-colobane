import { prisma } from '../infrastructure/prisma/prismaClient';

async function fixMigrationStatus() {
  console.log('🔄 Attempting to fix migration status...');
  const migrationName = '20260109215603_add_order_number';

  try {
    // 1. Check if the failed migration exists
    const failedMigrations = await prisma.$queryRaw`
      SELECT id, migration_name, finished_at 
      FROM "_prisma_migrations" 
      WHERE migration_name = ${migrationName}
    `;
    console.log('Found migrations:', failedMigrations);

    // 2. Delete the failed migration record
    // This allows Prisma to try applying it again (using our new safe script)
    const result = await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = ${migrationName}
    `;
    
    console.log(`✅ Deleted ${result} failed migration records.`);
    console.log('You can now run "npx prisma migrate deploy" to re-apply the fixed migration.');

  } catch (error) {
    console.error('❌ Error fixing migration status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrationStatus();
