// src/core/utils/completenessScore.ts

export function computeProfileCompleteness(provider: {
  avatarUrl?: string | null;
  bio?: string | null;
  whatsappNumber?: string | null;
  primaryZoneId?: number | null;
  zones?: any[];
  availableDays?: string[];
  openTime?: string | null;
  closeTime?: string | null;
  services?: any[];
}): number {
  let score = 0;
  if (provider.avatarUrl && provider.avatarUrl.trim().length > 0) score += 15;
  if (provider.bio && provider.bio.trim().length > 10) score += 15;
  if (provider.whatsappNumber && provider.whatsappNumber.trim().length > 0) score += 15;
  if (provider.primaryZoneId) score += 15;
  if (provider.zones && provider.zones.length > 0) score += 10;
  if (provider.availableDays && provider.availableDays.length > 0) score += 10;
  if (provider.openTime && provider.closeTime) score += 10;
  if (provider.services && provider.services.length > 0) score += 10;
  return Math.min(100, score);
}
