import { Router } from "express";
import { verifyEmailController } from "../controllers/emailVerificationController";

const router = Router();

router.get("/verify-email", verifyEmailController);

export default router;
