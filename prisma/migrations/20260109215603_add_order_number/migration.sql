/*
  Migration to add orderNumber field with handling for existing data
*/

-- Step 1: Add the column as nullable first
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

-- Step 2: Generate order numbers for existing orders using a PostgreSQL function
DO $$
DECLARE
    order_record RECORD;
    new_order_number TEXT;
    is_unique BOOLEAN;
    attempt INT;
BEGIN
    FOR order_record IN SELECT id FROM "Order" WHERE "orderNumber" IS NULL LOOP
        is_unique := FALSE;
        attempt := 0;
        
        WHILE NOT is_unique AND attempt < 10 LOOP
            -- Generate order number: CLB-YYYYMMDD-XXXXXX
            new_order_number := 'CLB-' || 
                               TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                               UPPER(SUBSTRING(MD5(RANDOM()::TEXT || order_record.id::TEXT) FROM 1 FOR 6));
            
            -- Check if unique
            IF NOT EXISTS (SELECT 1 FROM "Order" WHERE "orderNumber" = new_order_number) THEN
                is_unique := TRUE;
                UPDATE "Order" SET "orderNumber" = new_order_number WHERE id = order_record.id;
            END IF;
            
            attempt := attempt + 1;
        END LOOP;
        
        -- Fallback if couldn't generate unique in 10 attempts
        IF NOT is_unique THEN
            new_order_number := 'CLB-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || order_record.id;
            UPDATE "Order" SET "orderNumber" = new_order_number WHERE id = order_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 3: Now make the column NOT NULL
ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;

-- Step 4: Create unique index
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
