import { prisma } from "../../../infrastructure/prisma/prismaClient";

interface CreateDeliveryZoneInput {
    name: string;
    city?: string;
    minAmountFree?: number;
    baseFee: number;
}

export async function createDeliveryZoneUsecase(input: CreateDeliveryZoneInput) {
    const { name, city, minAmountFree, baseFee } = input;

    const zone = await prisma.deliveryZone.create({
        data: {
            name,
            city,
            minAmountFree,
            baseFee,
            isActive: true
        }
    });

    return zone;
}
