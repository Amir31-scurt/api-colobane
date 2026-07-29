// src/infrastructure/http/controllers/services/adminServicesController.ts
import type { Request, Response } from "express";
import { prisma } from "../../../prisma/prismaClient";
import { VerificationLevel, BookingStatus } from "@prisma/client";
import { computeProfileCompleteness } from "../../../../core/utils/completenessScore";

/**
 * VUE 1 : Executive Dashboard & KPIs Overview
 */
export async function adminExecutiveDashboardController(req: Request, res: Response) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalProviders,
      pendingProviders,
      verifiedProviders,
      suspendedProviders,
      allProvidersForCompleteness,
      totalSearchesToday,
      totalSearchesAllTime,
      successfulSearchesAllTime,
      totalLeadsToday,
      totalLeadsAllTime,
      recentSearches,
      recentLeads,
    ] = await Promise.all([
      prisma.serviceProvider.count(),
      prisma.serviceProvider.count({ where: { validationStatus: "PENDING" as any } }),
      prisma.serviceProvider.count({ where: { isVerified: true } }),
      prisma.serviceProvider.count({ where: { validationStatus: "SUSPENDED" as any } }),
      prisma.serviceProvider.findMany({
        select: {
          avatarUrl: true,
          bio: true,
          whatsappNumber: true,
          primaryZoneId: true,
          availableDays: true,
          openTime: true,
          closeTime: true,
          zones: true,
          services: true,
        },
      }),
      (prisma as any).serviceSearchLog.count({
        where: { timestamp: { gte: todayStart } },
      }).catch(() => 0),
      (prisma as any).serviceSearchLog.count().catch(() => 0),
      (prisma as any).serviceSearchLog.count({
        where: { resultsCount: { gt: 0 } },
      }).catch(() => 0),
      (prisma as any).serviceLeadLog.count({
        where: { timestamp: { gte: todayStart } },
      }).catch(() => 0),
      (prisma as any).serviceLeadLog.count().catch(() => 0),
      (prisma as any).serviceSearchLog.findMany({
        where: { timestamp: { gte: thirtyDaysAgo } },
        select: { timestamp: true, resultsCount: true },
      }).catch(() => []),
      (prisma as any).serviceLeadLog.findMany({
        where: { timestamp: { gte: thirtyDaysAgo } },
        select: { timestamp: true },
      }).catch(() => []),
    ]);

    // Calculate Average Completeness Score
    let avgCompleteness = 0;
    if (allProvidersForCompleteness.length > 0) {
      const totalScore = allProvidersForCompleteness.reduce(
        (acc: number, p: any) => acc + computeProfileCompleteness(p),
        0
      );
      avgCompleteness = Math.round(totalScore / allProvidersForCompleteness.length);
    }

    // Coverage Rate
    const coverageRate = totalSearchesAllTime > 0
      ? Math.round((successfulSearchesAllTime / totalSearchesAllTime) * 100)
      : 100;

    // Group 30-day activity chart data
    const dailyMap: Record<string, { date: string; searches: number; leads: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      dailyMap[dateKey] = { date: dateKey, searches: 0, leads: 0 };
    }

    recentSearches.forEach((s: any) => {
      const dayStr = new Date(s.timestamp).toISOString().split("T")[0];
      if (dailyMap[dayStr]) dailyMap[dayStr].searches++;
    });

    recentLeads.forEach((l: any) => {
      const dayStr = new Date(l.timestamp).toISOString().split("T")[0];
      if (dailyMap[dayStr]) dailyMap[dayStr].leads++;
    });

    const activityChartData = Object.values(dailyMap);

    return res.json({
      kpis: {
        totalProviders,
        activeProviders: totalProviders - suspendedProviders,
        pendingProviders,
        verifiedProviders,
        suspendedProviders,
        avgCompletenessScore: avgCompleteness,
        searchesToday: totalSearchesToday,
        totalSearches: totalSearchesAllTime,
        leadsToday: totalLeadsToday,
        totalLeads: totalLeadsAllTime,
        coverageRate,
      },
      activityChartData,
    });
  } catch (err) {
    console.error("[adminExecutiveDashboard]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

/**
 * VUE 2 : Provider Management Table
 */
export async function adminProviderManagementController(req: Request, res: Response) {
  try {
    const { q, validationStatus, zoneId, page = "1", pageSize = "20" } = req.query;

    const pageNum = Math.max(1, Number(page));
    const sizeNum = Math.max(1, Number(pageSize));
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};

    if (q) {
      const searchStr = String(q).trim();
      where.OR = [
        { name: { contains: searchStr, mode: "insensitive" } },
        { phone: { contains: searchStr, mode: "insensitive" } },
        { whatsappNumber: { contains: searchStr, mode: "insensitive" } },
        { bio: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    if (validationStatus) {
      where.validationStatus = String(validationStatus);
    }

    if (zoneId) {
      const zId = Number(zoneId);
      where.OR = [
        { primaryZoneId: zId },
        { zones: { some: { zoneId: zId } } },
      ];
    }

    const [providers, totalCount] = await Promise.all([
      prisma.serviceProvider.findMany({
        where,
        skip,
        take: sizeNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          primaryZone: true,
          zones: { include: { zone: true } },
          services: { select: { id: true, name: true } },
          _count: { select: { bookings: true, services: true, leadLogs: true } },
        },
      }),
      prisma.serviceProvider.count({ where }),
    ]);

    const formattedProviders = providers.map((p: any) => ({
      ...p,
      profileCompletenessScore: computeProfileCompleteness(p),
      bookingCount: p._count?.bookings || 0,
      serviceCount: p._count?.services || 0,
      leadCount: p._count?.leadLogs || 0,
    }));

    return res.json({
      providers: formattedProviders,
      totalCount,
      page: pageNum,
      pageSize: sizeNum,
      totalPages: Math.ceil(totalCount / sizeNum),
    });
  } catch (err) {
    console.error("[adminProviderManagement]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

/**
 * VUE 2 Action : Approve / Certify / Suspend provider
 */
export async function adminUpdateProviderStatusController(req: Request, res: Response) {
  try {
    const providerId = Number(req.params.providerId);
    if (isNaN(providerId)) return res.status(400).json({ error: "INVALID_ID" });

    const { validationStatus, isVerified, verificationLevel } = req.body;

    const updateData: any = {};
    if (validationStatus) updateData.validationStatus = validationStatus;
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified);
    if (verificationLevel) updateData.verificationLevel = verificationLevel;

    if (validationStatus === "VERIFIED" && isVerified === undefined) {
      updateData.isVerified = true;
      updateData.verificationLevel = "CERTIFIED";
    }

    const updated = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: updateData,
      include: { primaryZone: true },
    });

    return res.json({ message: "Statut du prestataire mis à jour.", provider: updated });
  } catch (err) {
    console.error("[adminUpdateProviderStatus]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

/**
 * VUE 2 Action : Quick Edit Provider Details (Admin / Field Agent)
 */
export async function adminQuickEditProviderController(req: Request, res: Response) {
  try {
    const providerId = Number(req.params.providerId);
    if (isNaN(providerId)) return res.status(400).json({ error: "INVALID_ID" });

    const {
      name, phone, whatsappNumber, primaryZoneId, zoneIds,
      onboardingMode, onboardedByAgentName, bio, openTime, closeTime, availableDays,
    } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (primaryZoneId !== undefined) updateData.primaryZoneId = primaryZoneId ? Number(primaryZoneId) : null;
    if (onboardingMode) updateData.onboardingMode = onboardingMode;
    if (onboardedByAgentName !== undefined) updateData.onboardedByAgentName = onboardedByAgentName;
    if (bio !== undefined) updateData.bio = bio;
    if (openTime !== undefined) updateData.openTime = openTime;
    if (closeTime !== undefined) updateData.closeTime = closeTime;
    if (availableDays) updateData.availableDays = availableDays;

    const provider = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: updateData,
    });

    // Update secondary zones if specified
    if (Array.isArray(zoneIds)) {
      await prisma.serviceProviderZone.deleteMany({
        where: { providerId, isPrimary: false },
      });
      const validSecondaryIds = zoneIds.filter((id: number) => id !== provider.primaryZoneId);
      if (validSecondaryIds.length > 0) {
        await prisma.serviceProviderZone.createMany({
          data: validSecondaryIds.map((zId: number) => ({
            providerId,
            zoneId: zId,
            isPrimary: false,
          })),
          skipDuplicates: true,
        });
      }
    }

    const fullUpdated = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: { primaryZone: true, zones: { include: { zone: true } } },
    });

    return res.json({ message: "Profil mis à jour.", provider: fullUpdated });
  } catch (err) {
    console.error("[adminQuickEditProvider]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

/**
 * VUE 3 : Demand Analytics & Search Insights (Unmet Demand & Geographic Mapping)
 */
export async function adminSearchAnalyticsController(req: Request, res: Response) {
  try {
    // 1. Searches with 0 results (Unmet Demand / Dead Zones)
    const deadZoneSearches = await (prisma as any).serviceSearchLog.findMany({
      where: { resultsCount: 0 },
      take: 200,
      orderBy: { timestamp: "desc" },
    }).catch(() => []);

    const deadZoneMap: Record<string, { query: string; count: number; lastSearched: Date }> = {};
    deadZoneSearches.forEach((log: any) => {
      const q = log.searchQuery;
      if (!deadZoneMap[q]) {
        deadZoneMap[q] = { query: q, count: 0, lastSearched: log.timestamp };
      }
      deadZoneMap[q].count++;
    });

    const unmetDemandList = Object.values(deadZoneMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 2. Top Searched Terms & Frequent Typos
    const allSearchLogs = await (prisma as any).serviceSearchLog.findMany({
      take: 500,
      orderBy: { timestamp: "desc" },
    }).catch(() => []);

    const termMap: Record<string, { query: string; totalSearches: number; successfulSearches: number }> = {};
    allSearchLogs.forEach((log: any) => {
      const q = log.searchQuery;
      if (!termMap[q]) {
        termMap[q] = { query: q, totalSearches: 0, successfulSearches: 0 };
      }
      termMap[q].totalSearches++;
      if (log.resultsCount > 0) termMap[q].successfulSearches++;
    });

    const topKeywords = Object.values(termMap)
      .sort((a, b) => b.totalSearches - a.totalSearches)
      .slice(0, 15);

    // 3. Geographic Supply vs Demand
    const zones = await prisma.serviceZone.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { primaryProviders: true, providers: true } },
      },
    });

    const zoneAnalytics = zones.map((z: any) => {
      const providerCount = (z._count?.primaryProviders || 0) + (z._count?.providers || 0);
      return {
        id: z.id,
        name: z.name,
        city: z.city,
        providerCount,
      };
    });

    return res.json({
      unmetDemandList,
      topKeywords,
      zoneAnalytics,
    });
  } catch (err) {
    console.error("[adminSearchAnalytics]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

/**
 * VUE 4 : Field Acquisition Tracker (Agents Terrain)
 */
export async function adminFieldAgentTrackerController(req: Request, res: Response) {
  try {
    const fieldProviders = await prisma.serviceProvider.findMany({
      where: { onboardingMode: "FIELD_AGENT" as any },
      select: {
        id: true,
        name: true,
        onboardedByAgentName: true,
        isVerified: true,
        validationStatus: true,
        createdAt: true,
        avatarUrl: true,
        bio: true,
        whatsappNumber: true,
        primaryZoneId: true,
        availableDays: true,
        openTime: true,
        closeTime: true,
        zones: true,
        services: true,
      },
    });

    const agentMap: Record<string, {
      agentName: string;
      totalRegistered: number;
      verifiedCount: number;
      pendingCount: number;
      totalCompleteness: number;
    }> = {};

    fieldProviders.forEach((p: any) => {
      const agent = p.onboardedByAgentName || "Agent Anonyme";
      if (!agentMap[agent]) {
        agentMap[agent] = {
          agentName: agent,
          totalRegistered: 0,
          verifiedCount: 0,
          pendingCount: 0,
          totalCompleteness: 0,
        };
      }
      agentMap[agent].totalRegistered++;
      if (p.isVerified || p.validationStatus === "VERIFIED") {
        agentMap[agent].verifiedCount++;
      } else if (p.validationStatus === "PENDING") {
        agentMap[agent].pendingCount++;
      }
      agentMap[agent].totalCompleteness += computeProfileCompleteness(p);
    });

    const agentStats = Object.values(agentMap).map((a) => ({
      ...a,
      avgCompletenessScore: a.totalRegistered > 0 ? Math.round(a.totalCompleteness / a.totalRegistered) : 0,
      validationRate: a.totalRegistered > 0 ? Math.round((a.verifiedCount / a.totalRegistered) * 100) : 0,
    })).sort((a, b) => b.totalRegistered - a.totalRegistered);

    return res.json({
      agentStats,
      totalFieldRegistered: fieldProviders.length,
    });
  } catch (err) {
    console.error("[adminFieldAgentTracker]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

/** Legacy support controllers */
export async function adminListProvidersController(req: Request, res: Response) {
  return adminProviderManagementController(req, res);
}

export async function adminVerifyProviderController(req: Request, res: Response) {
  return adminUpdateProviderStatusController(req, res);
}

export async function adminListBookingsController(req: Request, res: Response) {
  try {
    const { status, page = "1", pageSize = "20" } = req.query;
    const pageNum = Math.max(1, Number(page));
    const sizeNum = Math.max(1, Number(pageSize));
    const skip = (pageNum - 1) * sizeNum;

    const where = status ? { status: status as BookingStatus } : {};

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: sizeNum,
        orderBy: { createdAt: "desc" },
        include: {
          service: true,
          provider: { select: { id: true, name: true, phone: true } },
          customer: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return res.json({ bookings, totalCount, page: pageNum, pageSize: sizeNum });
  } catch (err) {
    console.error("[adminListBookings]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminServicesStatsController(req: Request, res: Response) {
  return adminExecutiveDashboardController(req, res);
}

/**
 * VUE 5 : Admin Services Management (Offerings Catalog)
 */
export async function adminListServicesCatalogController(req: Request, res: Response) {
  try {
    const { q, categoryId, providerId, isActive, page = "1", pageSize = "20" } = req.query;
    const pageNum = Math.max(1, Number(page));
    const sizeNum = Math.max(1, Number(pageSize));
    const skip = (pageNum - 1) * sizeNum;

    const where: any = {};
    if (q) {
      const s = String(q).trim();
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { description: { contains: s, mode: "insensitive" } },
        { provider: { name: { contains: s, mode: "insensitive" } } },
      ];
    }
    if (categoryId && categoryId !== "ALL") where.categoryId = Number(categoryId);
    if (providerId) where.providerId = Number(providerId);
    if (isActive !== undefined && isActive !== "ALL") where.isActive = isActive === "true";

    const [items, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: true,
          provider: {
            select: { id: true, name: true, phone: true, isVerified: true, avatarUrl: true, primaryZone: true },
          },
          _count: { select: { bookings: true } },
        },
        skip,
        take: sizeNum,
        orderBy: { createdAt: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    return res.json({
      items,
      total,
      page: pageNum,
      pageSize: sizeNum,
      totalPages: Math.ceil(total / sizeNum),
    });
  } catch (err) {
    console.error("[adminListServicesCatalog]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminToggleServiceController(req: Request, res: Response) {
  try {
    const serviceId = Number(req.params.serviceId);
    const existing = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!existing) return res.status(404).json({ error: "SERVICE_NOT_FOUND" });

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: !existing.isActive },
    });

    return res.json(updated);
  } catch (err) {
    console.error("[adminToggleService]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminQuickEditServiceController(req: Request, res: Response) {
  try {
    const serviceId = Number(req.params.serviceId);
    const { name, description, priceType, price, minPrice, maxPrice, requiresQuote, categoryId, isActive } = req.body;

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(priceType && { priceType }),
        ...(price !== undefined && { price: price ? Number(price) : null }),
        ...(minPrice !== undefined && { minPrice: minPrice ? Number(minPrice) : null }),
        ...(maxPrice !== undefined && { maxPrice: maxPrice ? Number(maxPrice) : null }),
        ...(requiresQuote !== undefined && { requiresQuote: Boolean(requiresQuote) }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: { category: true, provider: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error("[adminQuickEditService]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

export async function adminCreateServiceController(req: Request, res: Response) {
  try {
    const { providerId, categoryId, name, description, priceType, price, minPrice, maxPrice, requiresQuote } = req.body;

    if (!providerId || !categoryId || !name) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS", message: "providerId, categoryId et name sont requis." });
    }

    const created = await prisma.service.create({
      data: {
        providerId: Number(providerId),
        categoryId: Number(categoryId),
        name: String(name).trim(),
        description: description ? String(description).trim() : "",
        priceType: priceType || "QUOTE",
        price: price ? Number(price) : null,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        requiresQuote: Boolean(requiresQuote),
        isActive: true,
      },
      include: { category: true, provider: true },
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("[adminCreateService]", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
}

