"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/notificationRoutes.ts
const express_1 = __importDefault(require("express"));
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.get("/", requireAuth_1.requireAuth, notificationController_1.listNotificationsController);
router.put("/:notificationId/read", requireAuth_1.requireAuth, notificationController_1.markNotificationReadController);
exports.default = router;
