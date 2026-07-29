// src/core/usecases/services/catalog/getProviderPublic.ts
import { prisma } from "../../../../infrastructure/prisma/prismaClient";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const includeFields = {
  primaryZone: true,
  zones: { include: { zone: true } },
  services: {
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" as const },
  },
  reviews: {
    orderBy: { createdAt: "desc" as const },
    take: 10,
    include: { customer: { select: { name: true, avatarUrl: true } } },
  },
  _count: { select: { reviews: true, bookings: true, services: true } },
};

export async function getProviderPublicUsecase(idOrSlug: string | number) {
  let targetId: number | undefined;

  if (typeof idOrSlug === "number") {
    targetId = idOrSlug;
  } else {
    const parsed = parseInt(idOrSlug, 10);
    if (!isNaN(parsed) && /^\d+$/.test(idOrSlug)) {
      targetId = parsed;
    } else {
      // Check for trailing ID e.g. "babacar-plomberie-express-1"
      const match = idOrSlug.match(/-(\d+)$/);
      if (match) {
        targetId = parseInt(match[1], 10);
      }
    }
  }

  let provider = null;

  if (targetId !== undefined) {
    provider = await prisma.serviceProvider.findUnique({
      where: { id: targetId },
      include: includeFields,
    });
  }

  if (!provider && typeof idOrSlug === "string") {
    // Try matching slugified name
    const allProviders = await prisma.serviceProvider.findMany({
      include: includeFields,
    });
    const cleanSlug = idOrSlug.toLowerCase();
    provider = allProviders.find((p) => slugify(p.name) === cleanSlug) || null;
  }

  if (!provider) throw new Error("PROVIDER_NOT_FOUND");
  return provider;
}

