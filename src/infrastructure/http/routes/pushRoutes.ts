import express from "express";
import { authRequired } from "../middlewares/authMiddleware.ts";
import { registerPushTokenController } from "../controllers/pushTokenController.ts";

const router = express.Router();

router.post("/register", authRequired, registerPushTokenController);

export default router;
