import express from "express";
import { getPublicStatsController } from "../controllers/publicController";

const router = express.Router();

router.get("/stats", getPublicStatsController);

export default router;
