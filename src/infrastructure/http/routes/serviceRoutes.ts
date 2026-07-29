// src/infrastructure/http/routes/serviceRoutes.ts
import express from "express";
import { requireAuth } from "../middlewares/auth/requireAuth";
import { requireRole } from "../middlewares/auth/requireRole";

// Public controllers
import {
  listZonesController,
  listServiceCategoriesController,
  listServicesPublicController,
  getServiceByIdController,
  getProviderPublicController,
} from "../controllers/services/servicePublicController";

// Provider controllers
import {
  registerProviderController,
  getMyProviderController,
  updateMyProviderController,
  createMyServiceController,
  listMyServicesController,
  updateMyServiceController,
  deleteMyServiceController,
  listMyProviderBookingsController,
  updateBookingStatusController,
  sendQuoteController,
} from "../controllers/services/serviceProviderController";

// Customer booking controllers
import {
  createBookingController,
  listMyBookingsController,
  createReviewController,
} from "../controllers/services/bookingController";

// Tracking controllers
import {
  logSearchController,
  logLeadController,
  logFeedbackController,
} from "../controllers/services/trackingController";

// Admin controllers
import {
  adminListProvidersController,
  adminVerifyProviderController,
  adminListBookingsController,
  adminServicesStatsController,
  adminExecutiveDashboardController,
  adminProviderManagementController,
  adminUpdateProviderStatusController,
  adminQuickEditProviderController,
  adminSearchAnalyticsController,
  adminFieldAgentTrackerController,
  adminListServicesCatalogController,
  adminToggleServiceController,
  adminQuickEditServiceController,
  adminCreateServiceController,
} from "../controllers/services/adminServicesController";

const router = express.Router();

// ════════════════════════════════════════════════════
// PUBLIC & TRACKING ROUTES
// ════════════════════════════════════════════════════

/** GET /api/services/zones — All active zones */
router.get("/zones", listZonesController);

/** GET /api/services/categories — All service categories */
router.get("/categories", listServiceCategoriesController);

/** GET /api/services — Public catalog with filters */
router.get("/", listServicesPublicController);

/** GET /api/services/providers/:providerId — Public provider profile */
router.get("/providers/:providerId", getProviderPublicController);

/** GET /api/services/:id — Service detail */
router.get("/:id", getServiceByIdController);

/** Tracking Endpoints */
router.post("/tracking/search", logSearchController);
router.post("/tracking/lead", logLeadController);
router.post("/tracking/feedback", logFeedbackController);

// ════════════════════════════════════════════════════
// CUSTOMER ROUTES (auth required)
// ════════════════════════════════════════════════════

/** POST /api/services/:serviceId/book — Create booking */
router.post("/:serviceId/book", requireAuth, createBookingController);

/** GET /api/services/me/bookings — My bookings as customer */
router.get("/me/bookings", requireAuth, listMyBookingsController);

/** POST /api/services/bookings/:bookingId/review — Leave a review */
router.post("/bookings/:bookingId/review", requireAuth, createReviewController);

// ════════════════════════════════════════════════════
// PROVIDER ROUTES (auth required)
// ════════════════════════════════════════════════════

/** POST /api/services/provider/register — Become a provider */
router.post("/provider/register", requireAuth, registerProviderController);

/** GET  /api/services/provider/me — My provider profile */
router.get("/provider/me", requireAuth, getMyProviderController);

/** PATCH /api/services/provider/me — Update my provider profile */
router.patch("/provider/me", requireAuth, updateMyProviderController);

/** POST  /api/services/provider/services — Create a service */
router.post("/provider/services", requireAuth, createMyServiceController);

/** GET   /api/services/provider/services — List my services */
router.get("/provider/services", requireAuth, listMyServicesController);

/** PATCH /api/services/provider/services/:serviceId — Update a service */
router.patch("/provider/services/:serviceId", requireAuth, updateMyServiceController);

/** DELETE /api/services/provider/services/:serviceId — Deactivate a service */
router.delete("/provider/services/:serviceId", requireAuth, deleteMyServiceController);

/** GET  /api/services/provider/bookings — Bookings I received */
router.get("/provider/bookings", requireAuth, listMyProviderBookingsController);

/** PATCH /api/services/provider/bookings/:bookingId/status — Update booking status */
router.patch("/provider/bookings/:bookingId/status", requireAuth, updateBookingStatusController);

/** PATCH /api/services/provider/bookings/:bookingId/quote — Send a quote */
router.patch("/provider/bookings/:bookingId/quote", requireAuth, sendQuoteController);

// ════════════════════════════════════════════════════
// ADMIN ROUTES (auth + ADMIN role required)
// ════════════════════════════════════════════════════

/** Executive Dashboard & Stats */
router.get("/admin/stats", requireAuth, requireRole("ADMIN"), adminExecutiveDashboardController);
router.get("/admin/dashboard-overview", requireAuth, requireRole("ADMIN"), adminExecutiveDashboardController);

/** Provider Management */
router.get("/admin/providers", requireAuth, requireRole("ADMIN"), adminProviderManagementController);
router.patch("/admin/providers/:providerId/verify", requireAuth, requireRole("ADMIN"), adminUpdateProviderStatusController);
router.put("/admin/providers/:providerId/quick-edit", requireAuth, requireRole("ADMIN"), adminQuickEditProviderController);

/** Search & Zone Analytics */
router.get("/admin/search-analytics", requireAuth, requireRole("ADMIN"), adminSearchAnalyticsController);

/** Field Acquisition Tracker */
router.get("/admin/field-acquisition", requireAuth, requireRole("ADMIN"), adminFieldAgentTrackerController);

/** Offerings & Services Catalog Management */
router.get("/admin/services-catalog", requireAuth, requireRole("ADMIN"), adminListServicesCatalogController);
router.patch("/admin/services-catalog/:serviceId/toggle", requireAuth, requireRole("ADMIN"), adminToggleServiceController);
router.put("/admin/services-catalog/:serviceId", requireAuth, requireRole("ADMIN"), adminQuickEditServiceController);
router.post("/admin/services-catalog", requireAuth, requireRole("ADMIN"), adminCreateServiceController);

/** Bookings */
router.get("/admin/bookings", requireAuth, requireRole("ADMIN"), adminListBookingsController);

export default router;
