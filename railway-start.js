#!/usr/bin/env node

/**
 * Railway Startup Script
 * This runs BEFORE the server starts, when the database is available
 */

import { execSync } from 'child_process';

console.log('🚂 Railway Startup Process...');

// Step 1: Fix the migration if needed
console.log('\n📋 Step 1: Checking for stuck migrations...');
try {
  execSync('npm run fix:railway', { stdio: 'inherit' });
  console.log('✅ Migration fix completed');
} catch (error) {
  console.log('⚠️  Migration fix had an error (may be OK if already fixed)');
}

// Step 2: Run migrations
console.log('\n📋 Step 2: Running database migrations...');
try {
  execSync('npm run prisma:migrate', { stdio: 'inherit' });
  console.log('✅ Migrations completed');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}

// Step 3: Start the server
console.log('\n📋 Step 3: Starting server...');
execSync('node dist/server.js', { stdio: 'inherit' });
