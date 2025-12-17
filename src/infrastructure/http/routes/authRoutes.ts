// src/infrastructure/http/routes/authRoutes.ts
import express from "express";
import {
  registerController,
  loginController,
  meController,
  refreshTokenController,
  requestPasswordResetController,
  resetPasswordController
} from "../controllers/authController";
import { authRequired } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

router.get("/me", authRequired, meController);

router.post("/refresh-token", refreshTokenController);

router.post("/request-password-reset", requestPasswordResetController);
router.post("/reset-password", resetPasswordController);

export default router;
