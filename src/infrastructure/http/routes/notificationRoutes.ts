// src/infrastructure/http/routes/notificationRoutes.ts
import express from "express";
import { requireAuth } from "../middlewares/auth/requireAuth";
import {
  listNotificationsController,
  markNotificationReadController
} from "../controllers/notificationController";

const router = express.Router();

router.get("/", requireAuth, listNotificationsController);
router.put("/:notificationId/read", requireAuth, markNotificationReadController);

export default router;
