/**
 * Generates a secure, unique order number
 * Format: CLB-YYYYMMDD-XXXXXX
 * Example: CLB-20260109-A7B2C9
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate 6-character random alphanumeric string
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `CLB-${year}${month}${day}-${randomPart}`;
}

/**
 * Ensures the generated order number is unique in the database
 */
export async function generateUniqueOrderNumber(prisma: any): Promise<string> {
  let orderNumber: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    orderNumber = generateOrderNumber();
    
    // Check if this order number already exists
    const existing = await prisma.order.findUnique({
      where: { orderNumber }
    });
    
    if (!existing) {
      isUnique = true;
      return orderNumber;
    }
    
    attempts++;
  }
  
  // Fallback: add timestamp to ensure uniqueness
  return `CLB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
