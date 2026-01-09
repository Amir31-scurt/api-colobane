# Railway Migration Fix

## Problem
The migration `20260109215603_add_order_number` is stuck in a "failed" state on Railway's production database.

## Solution

### Step 1: Update Railway START Command (Not Build Command!)

**Important**: The database is NOT available during build time on Railway. We need to run the fix at **runtime** (when starting the server).

In your Railway dashboard:

1. Go to your service settings
2. Find the **Start Command** setting (NOT Build Command)
3. **Temporarily** change it to:
```bash
npm run railway:start
```

This command will:
1. ✅ Run the migration fix (delete stuck record)
2. ✅ Run database migrations
3. ✅ Start your server

### Step 2: Keep Build Command Normal

Your **Build Command** should remain:
```bash
npm run build
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

### Step 3: Restore Normal Start Command (After First Successful Deploy)

Once the migration is fixed and working, you can restore your start command to just:
```bash
npm run start
```

Or keep using `npm run railway:start` - it's smart enough to skip the fix if not needed.

