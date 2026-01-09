import { prisma } from '../infrastructure/prisma/prismaClient';

async function markMigrationAsApplied() {
  console.log('✅ Marking migration as successfully applied...');
  const migrationName = '20260109215603_add_order_number';

  try {
    // Check if it already exists (to be safe)
    const existing = await prisma.$queryRaw`
      SELECT id FROM "_prisma_migrations" WHERE migration_name = ${migrationName}
    `;

    if (Array.isArray(existing) && existing.length > 0) {
      console.log('Migration already recorded. Nothing to do.');
      return;
    }

    // Insert success record
    // We use a random UUID for ID, and current timestamp
    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" (
        id, checksum, finished_at, migration_name, 
        logs, rolled_back_at, started_at, applied_steps_count
      )
      VALUES (
        gen_random_uuid(), 
        'manual_fix', 
        NOW(), 
        ${migrationName}, 
        NULL, 
        NULL, 
        NOW(), 
        1
      )
    `;
    
    console.log('✅ Successfully marked migration as applied in database.');

  } catch (error) {
    console.error('❌ Error marking migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markMigrationAsApplied();
