"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../infrastructure/prisma/prismaClient");
const orderNumberGenerator_1 = require("../core/helpers/orderNumberGenerator");
async function backfillOrderNumbers() {
    console.log('Starting to backfill order numbers for existing orders...');
    // Get all orders without orderNumber
    const orders = await prismaClient_1.prisma.$queryRaw `
    SELECT id FROM "Order" WHERE "orderNumber" IS NULL
  `;
    console.log(`Found ${orders.length} orders without orderNumber`);
    for (const order of orders) {
        let orderNumber;
        let isUnique = false;
        let attempts = 0;
        // Generate a unique order number
        while (!isUnique && attempts < 10) {
            orderNumber = (0, orderNumberGenerator_1.generateOrderNumber)();
            const existing = await prismaClient_1.prisma.$queryRaw `
        SELECT COUNT(*) as count FROM "Order" WHERE "orderNumber" = ${orderNumber}
      `;
            if (Number(existing[0].count) === 0) {
                isUnique = true;
                // Update the order with the new orderNumber
                await prismaClient_1.prisma.$executeRaw `
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
            await prismaClient_1.prisma.$executeRaw `
        UPDATE "Order" SET "orderNumber" = ${fallbackNumber} WHERE id = ${order.id}
      `;
            console.log(`✓ Updated order ${order.id} with fallback orderNumber: ${fallbackNumber}`);
        }
    }
    console.log('✅ Backfill completed!');
    await prismaClient_1.prisma.$disconnect();
}
backfillOrderNumbers()
    .catch((error) => {
    console.error('Error during backfill:', error);
    process.exit(1);
});
