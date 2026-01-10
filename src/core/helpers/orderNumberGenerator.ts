import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

/**
 * Generates a semantic order number
 * Format: CLB-YYYYMMDD-XXXXXX
 * Example: CLB-20240115-A7B2C9
 */
export function generateOrderNumber(): string {
  const prefix = "CLB";
  const dateStr = format(new Date(), "yyyyMMdd");
  
  // Generate 6 random alphanumeric characters
  const randomChars = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `${prefix}-${dateStr}-${randomChars}`;
}

/**
 * Generates a guaranteed unique order number
 */
export async function generateUniqueOrderNumber(prisma: PrismaClient): Promise<string> {
  let isUnique = false;
  let orderNumber = "";
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    orderNumber = generateOrderNumber();
    
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!existingOrder) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique order number after 10 attempts");
  }

  return orderNumber;
}
