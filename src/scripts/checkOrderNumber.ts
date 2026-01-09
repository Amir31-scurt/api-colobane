import { prisma } from '../infrastructure/prisma/prismaClient';

async function checkOrderNumberColumn() {
  try {
    // Try to query the orderNumber column
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      AND column_name = 'orderNumber';
    `;
    
    console.log('Query result:', result);
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ orderNumber column EXISTS in Order table');
      
      // Check if any orders have orderNumber
      const ordersWithNumber = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Order" WHERE "orderNumber" IS NOT NULL;
      `;
      console.log('Orders with orderNumber:', ordersWithNumber);
      
      // Check total orders
      const totalOrders = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Order";
      `;
      console.log('Total orders:', totalOrders);
    } else {
      console.log('❌ orderNumber column DOES NOT exist in Order table');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking column:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkOrderNumberColumn();
