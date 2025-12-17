// src/infrastructure/http/routes/notificationRoutes.ts
import express from "express";
import { authRequired } from "../middlewares/authMiddleware";
import {
  listNotificationsController,
  markNotificationReadController
} from "../controllers/notificationController";

const router = express.Router();

router.get("/", authRequired, listNotificationsController);
router.put("/:notificationId/read", authRequired, markNotificationReadController);

export default router;
