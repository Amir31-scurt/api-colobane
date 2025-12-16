import express from "express";
import { searchController } from "../controllers/searchController.ts";

const router = express.Router();

router.get("/", searchController);

export default router;
