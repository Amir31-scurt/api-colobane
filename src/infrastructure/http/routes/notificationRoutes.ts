// src/infrastructure/http/routes/notificationRoutes.ts
import express from "express";
import { authRequired } from "../middlewares/authMiddleware.ts";
import {
  listNotificationsController,
  markNotificationReadController
} from "../controllers/notificationController.ts";

const router = express.Router();

router.get("/", authRequired, listNotificationsController);
router.put("/:notificationId/read", authRequired, markNotificationReadController);

export default router;
