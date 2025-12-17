import express from "express";
import { authRequired } from "../middlewares/authMiddleware";
import { registerPushTokenController } from "../controllers/pushTokenController";

const router = express.Router();

router.post("/register", authRequired, registerPushTokenController);

export default router;
