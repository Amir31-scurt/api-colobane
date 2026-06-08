// src/core/usecases/services/providers/registerProvider.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { ProviderType } from "@prisma/client";

interface RegisterProviderInput {
  userId: number;
  name: string;
  bio?: string;
  type?: ProviderType;
  phone: string;
  whatsappNumber?: string;
  alternatePhone?: string;
  primaryZoneId?: number;
  hasVehicle?: boolean;
  maxRadiusKm?: number;
  availableDays?: string[];
  openTime?: string;
  closeTime?: string;
  respectsPrayerTime?: boolean;
  zoneIds?: number[]; // Additional zones beyond primary
}

export async function registerProviderUsecase(input: RegisterProviderInput) {
  // Check if already a provider
  const existing = await prisma.serviceProvider.findUnique({
    where: { userId: input.userId },
  });
  if (existing) throw new Error("ALREADY_A_PROVIDER");

  const provider = await prisma.serviceProvider.create({
    data: {
      userId: input.userId,
      name: input.name,
      bio: input.bio,
      type: input.type ?? "INDIVIDUAL",
      phone: input.phone,
      whatsappNumber: input.whatsappNumber,
      alternatePhone: input.alternatePhone,
      primaryZoneId: input.primaryZoneId,
      hasVehicle: input.hasVehicle ?? false,
      maxRadiusKm: input.maxRadiusKm,
      availableDays: input.availableDays ?? [],
      openTime: input.openTime,
      closeTime: input.closeTime,
      respectsPrayerTime: input.respectsPrayerTime ?? true,
      wallet: { create: { balance: 0, totalEarned: 0 } },
      zones: input.primaryZoneId
        ? {
            create: [{ zoneId: input.primaryZoneId, isPrimary: true }],
          }
        : undefined,
    },
    include: {
      primaryZone: true,
      zones: { include: { zone: true } },
      wallet: true,
    },
  });

  // Add extra zones if provided
  if (input.zoneIds && input.zoneIds.length > 0) {
    const extraZones = input.zoneIds.filter((id) => id !== input.primaryZoneId);
    if (extraZones.length > 0) {
      await prisma.serviceProviderZone.createMany({
        data: extraZones.map((zoneId) => ({
          providerId: provider.id,
          zoneId,
          isPrimary: false,
        })),
        skipDuplicates: true,
      });
    }
  }

  return provider;
}
