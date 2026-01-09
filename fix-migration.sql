-- First, let's check the current state of migrations
SELECT * FROM "_prisma_migrations" WHERE migration_name = '20260109215603_add_order_number';

-- If the migration shows as 'failed', we need to delete it
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260109215603_add_order_number';

-- Then check if the orderNumber column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Order' AND column_name = 'orderNumber';

-- If column doesn't exist, we'll need to run the migration again
-- If it does exist, we'll manually insert the migration record as successful
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  gen_random_uuid(),
  'custom_checksum',
  NOW(),
  '20260109215603_add_order_number',
  NULL,
  NULL,
  NOW(),
  1
);
