import express from "express";
import { generateDescriptionController } from "../controllers/aiController";
import { requireAuth } from "../middlewares/auth/requireAuth";
import {
  getChatStateController,
  processChatMessageController,
  skipLogoController,
  dismissCoachMarkController,
  setProductImageController,
} from "../controllers/chatOnboardingController";

const router = express.Router();

// Generate AI description (requires login)
router.post("/generate-description", requireAuth, generateDescriptionController);

// ── Conversational seller onboarding ──────────────────────────────────────────
// GET  /api/ai/chat/state         — Current state (for page reload / resumption)
// POST /api/ai/chat               — Send a message, get assistant reply
// POST /api/ai/chat/skip-logo     — Explicitly skip logo step
// POST /api/ai/chat/product-image — Set productImageUrl after upload
// POST /api/ai/chat/dismiss-coachmark — Dismiss a coach-mark by name

router.get("/chat/state", requireAuth, getChatStateController);
router.post("/chat", requireAuth, processChatMessageController);
router.post("/chat/skip-logo", requireAuth, skipLogoController);
router.post("/chat/product-image", requireAuth, setProductImageController);
router.post("/chat/dismiss-coachmark", requireAuth, dismissCoachMarkController);

export default router;

