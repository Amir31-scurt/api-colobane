# Railway Migration Fix

## Problem
The migration `20260109215603_add_order_number` is stuck in a "failed" state on Railway's production database.

## Solution

### Step 1: Run the Fix Script on Railway

You have two options:

#### Option A: Add to Build Command (Temporary)
In your Railway dashboard, temporarily change the build command to:
```bash
npm run fix:railway && npm run prisma:migrate && npm run build
```

This will:
1. Delete the failed migration record
2. Run migrations (which will now succeed)
3. Build the app

#### Option B: Run via Railway CLI
If you have Railway CLI installed:
```bash
railway run npm run fix:railway
railway run npm run prisma:migrate
```

### Step 2: Restore Normal Build Command
After the fix runs successfully once, restore your build command to:
```bash
npm run prisma:migrate && npm run build
```

## What the Fix Does

The `fix:railway` script:
1. Connects to your Railway database using `DATABASE_URL`
2. Deletes the failed migration record from `_prisma_migrations` table
3. Allows Prisma to re-attempt the migration with the fixed SQL

## Verification

After running, check Railway logs for:
```
✅ DELETED 1 records. The blockage is removed.
🎉 Standard deployment should work!
```

Then verify the migration succeeded:
```
✔ Applied migration: 20260109215603_add_order_number
```
