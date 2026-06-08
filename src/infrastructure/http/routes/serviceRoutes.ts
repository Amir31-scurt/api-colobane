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

// Admin controllers
import {
  adminListProvidersController,
  adminVerifyProviderController,
  adminListBookingsController,
  adminServicesStatsController,
} from "../controllers/services/adminServicesController";

const router = express.Router();

// ════════════════════════════════════════════════════
// PUBLIC ROUTES (no auth required)
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

/** GET  /api/services/admin/stats — Dashboard stats */
router.get("/admin/stats", requireAuth, requireRole("ADMIN"), adminServicesStatsController);

/** GET  /api/services/admin/providers — All providers */
router.get("/admin/providers", requireAuth, requireRole("ADMIN"), adminListProvidersController);

/** PATCH /api/services/admin/providers/:providerId/verify — Verify a provider */
router.patch("/admin/providers/:providerId/verify", requireAuth, requireRole("ADMIN"), adminVerifyProviderController);

/** GET  /api/services/admin/bookings — All bookings */
router.get("/admin/bookings", requireAuth, requireRole("ADMIN"), adminListBookingsController);

export default router;
