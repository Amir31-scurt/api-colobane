import express from "express";
import { generateDescriptionController } from "../controllers/aiController";
import { requireAuth } from "../middlewares/auth/requireAuth";

const router = express.Router();

// Generate AI description (requires login)
router.post("/generate-description", requireAuth, generateDescriptionController);

export default router;
