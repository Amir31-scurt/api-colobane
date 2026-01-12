
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setCommissionRate() {
  try {
    const RATE = 5.0; // 5%

    console.log(`Setting Commission Rate to ${RATE}%...`);

    // 1. Désactiver les anciennes commissions
    await prisma.marketplaceFee.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // 2. Créer la nouvelle commission de 5%
    const newFee = await prisma.marketplaceFee.create({
      data: {
        name: `Commission Standard (${RATE}%)`,
        type: 'PERCENTAGE',
        target: 'SELLER', // Appliqué au vendeur
        value: RATE,
        isActive: true
      }
    });

    console.log('✅ Commission mise à jour avec succès :');
    console.log(newFee);

  } catch (error) {
    console.error('Erreur lors de la mise à jour :', error);
  } finally {
    await prisma.$disconnect();
  }
}

setCommissionRate();
