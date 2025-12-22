// src/http/routes/user.routes.ts
import { Router } from "express";
import { addEmailController } from "../controllers/userController";
import { authRequired } from "../middlewares/authMiddleware";


const router = Router();

router.post("/email", authRequired, addEmailController);

export default router;
