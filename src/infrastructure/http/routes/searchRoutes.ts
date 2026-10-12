import express from "express";
import { searchController } from "../controllers/searchController";
import { searchRateLimiter } from "../../../config/rateLimit";

const router = express.Router();

router.get("/", searchRateLimiter, searchController);

export default router;
