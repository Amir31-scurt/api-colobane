// src/core/usecases/services/providers/updateProvider.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { ProviderType } from "@prisma/client";

interface UpdateProviderInput {
  userId: number;
  name?: string;
  bio?: string;
  type?: ProviderType;
  phone?: string;
  whatsappNumber?: string;
  alternatePhone?: string;
  primaryZoneId?: number;
  hasVehicle?: boolean;
  maxRadiusKm?: number;
  availableDays?: string[];
  openTime?: string;
  closeTime?: string;
  respectsPrayerTime?: boolean;
  isAvailableNow?: boolean;
  avatarUrl?: string;
  zoneIds?: number[]; // Full replacement of extra zones
}

export async function updateProviderUsecase(input: UpdateProviderInput) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: input.userId },
  });
  if (!provider) throw new Error("PROVIDER_NOT_FOUND");

  const { userId, zoneIds, ...fields } = input;

  const updated = await prisma.serviceProvider.update({
    where: { userId },
    data: {
      ...(fields.name !== undefined && { name: fields.name }),
      ...(fields.bio !== undefined && { bio: fields.bio }),
      ...(fields.type !== undefined && { type: fields.type }),
      ...(fields.phone !== undefined && { phone: fields.phone }),
      ...(fields.whatsappNumber !== undefined && { whatsappNumber: fields.whatsappNumber }),
      ...(fields.alternatePhone !== undefined && { alternatePhone: fields.alternatePhone }),
      ...(fields.primaryZoneId !== undefined && { primaryZoneId: fields.primaryZoneId }),
      ...(fields.hasVehicle !== undefined && { hasVehicle: fields.hasVehicle }),
      ...(fields.maxRadiusKm !== undefined && { maxRadiusKm: fields.maxRadiusKm }),
      ...(fields.availableDays !== undefined && { availableDays: fields.availableDays }),
      ...(fields.openTime !== undefined && { openTime: fields.openTime }),
      ...(fields.closeTime !== undefined && { closeTime: fields.closeTime }),
      ...(fields.respectsPrayerTime !== undefined && { respectsPrayerTime: fields.respectsPrayerTime }),
      ...(fields.isAvailableNow !== undefined && { isAvailableNow: fields.isAvailableNow }),
      ...(fields.avatarUrl !== undefined && { avatarUrl: fields.avatarUrl }),
    },
    include: {
      primaryZone: true,
      zones: { include: { zone: true } },
      wallet: true,
    },
  });

  // If zoneIds provided, replace all secondary zones
  if (zoneIds !== undefined) {
    await prisma.serviceProviderZone.deleteMany({
      where: { providerId: provider.id, isPrimary: false },
    });
    const primaryId = fields.primaryZoneId ?? provider.primaryZoneId;
    const extras = zoneIds.filter((id) => id !== primaryId);
    if (extras.length > 0) {
      await prisma.serviceProviderZone.createMany({
        data: extras.map((zoneId) => ({
          providerId: provider.id,
          zoneId,
          isPrimary: false,
        })),
        skipDuplicates: true,
      });
    }
  }

  return updated;
}
