"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const router = express_1.default.Router();
// ... existing code ...
// ... (existing routes)
router.get("/me", requireAuth_1.requireAuth, authController_1.meController);
router.patch("/me", requireAuth_1.requireAuth, authController_1.updateProfileController);
router.post("/google", authController_1.googleLoginController);
router.post("/apple", authController_1.appleLoginController);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Déconnecté
 */
router.post("/logout", authController_1.logoutController);
exports.default = router;
