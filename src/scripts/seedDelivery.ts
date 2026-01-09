
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 0. Cleanup
    console.log('Cleaning up old data...');
    await prisma.referenceLocation.deleteMany({});
    await prisma.deliveryZone.deleteMany({});

    // 1. Seed Delivery Methods
    console.log('Seeding Delivery Methods...');
    const methods = [
        { code: 'STANDARD', name: 'Livraison Standard' },
        { code: 'SELF_COLLECT', name: 'Je gère mon livreur / Retrait' },
    ];

    for (const m of methods) {
        await prisma.deliveryMethod.upsert({
            where: { code: m.code },
            update: { name: m.name },
            create: { code: m.code, name: m.name, isActive: true },
        });
    }

    // 2. Seed Delivery Zones
    console.log('Seeding Delivery Zones...');
    const zones = [
        { name: 'Dakar Centre', baseFee: 1500, city: 'Dakar' },
        { name: 'Dakar Banlieue 1', baseFee: 2000, city: 'Dakar' }, // Proche: Pikine, etc
        { name: 'Dakar Banlieue 2', baseFee: 3000, city: 'Dakar' }, // Loin: Keur Massar, Rufisque
    ];

    const seededZones: Record<string, number> = {};

    for (const z of zones) {
        const zone = await prisma.deliveryZone.create({
            data: {
                name: z.name,
                baseFee: z.baseFee,
                city: z.city,
            }
        });
        seededZones[z.name] = zone.id;
        console.log(`Created Zone: ${z.name}`);
    }

    // 3. Seed Reference Locations (Neighborhoods)
    console.log('Seeding Neighborhoods...');
    
    // Coordinates are approximate centers
    const neighborhoods = [
        // Dakar Centre
        { name: "Plateau", lat: 14.6685, lng: -17.4334, zone: "Dakar Centre" },
        { name: "Médina", lat: 14.6817, lng: -17.4528, zone: "Dakar Centre" },
        { name: "Gueule Tapée", lat: 14.6866, lng: -17.4593, zone: "Dakar Centre" },
        { name: "Fann", lat: 14.6908, lng: -17.4668, zone: "Dakar Centre" },
        { name: "Point E", lat: 14.6953, lng: -17.4619, zone: "Dakar Centre" },
        { name: "Amitié", lat: 14.7027, lng: -17.4563, zone: "Dakar Centre" },
        { name: "Grand Dakar", lat: 14.7082, lng: -17.4475, zone: "Dakar Centre" },
        { name: "HLM", lat: 14.7134, lng: -17.4497, zone: "Dakar Centre" },
        { name: "Sicap Liberté", lat: 14.7188, lng: -17.4552, zone: "Dakar Centre" },
        { name: "Mermoz", lat: 14.7061, lng: -17.4725, zone: "Dakar Centre" },
        { name: "Sacré-Cœur", lat: 14.7169, lng: -17.4658, zone: "Dakar Centre" },
        { name: "Ouakam", lat: 14.7265, lng: -17.4853, zone: "Dakar Centre" },
        { name: "Ngor", lat: 14.7432, lng: -17.5146, zone: "Dakar Centre" },
        { name: "Yoff", lat: 14.7523, lng: -17.4682, zone: "Dakar Centre" },
        { name: "Almadies", lat: 14.7471, lng: -17.5258, zone: "Dakar Centre" },

        // Banlieue 1
        { name: "Parcelles Assainies", lat: 14.7456, lng: -17.4427, zone: "Dakar Banlieue 1" },
        { name: "Patte d'Oie", lat: 14.7335, lng: -17.4431, zone: "Dakar Banlieue 1" },
        { name: "Grand Yoff", lat: 14.7298, lng: -17.4512, zone: "Dakar Banlieue 1" },
        { name: "Pikine", lat: 14.7562, lng: -17.3996, zone: "Dakar Banlieue 1" },
        { name: "Guédiawaye", lat: 14.7678, lng: -17.4215, zone: "Dakar Banlieue 1" },
        { name: "Thiaroye", lat: 14.7573, lng: -17.3698, zone: "Dakar Banlieue 1" },

        // Banlieue 2
        { name: "Keur Massar", lat: 14.7832, lng: -17.3115, zone: "Dakar Banlieue 2" },
        { name: "Rufisque", lat: 14.7139, lng: -17.2711, zone: "Dakar Banlieue 2" },
        { name: "Diamniadio", lat: 14.7214, lng: -17.2023, zone: "Dakar Banlieue 2" },
        { name: "Sangalkam", lat: 14.7825, lng: -17.2278, zone: "Dakar Banlieue 2" },
    ];

    for (const n of neighborhoods) {
        await prisma.referenceLocation.create({
            data: {
                name: n.name,
                latitude: n.lat,
                longitude: n.lng,
                city: "Dakar",
                deliveryZoneId: seededZones[n.zone]
            }
        })
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
