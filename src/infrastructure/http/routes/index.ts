import { Router } from "express";
import { hello } from "../../../controllers/user.controller";

const router = Router();

router.get("/", hello);

export default router;
