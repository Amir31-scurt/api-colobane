"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/http/routes/user.routes.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/email", authMiddleware_1.authRequired, userController_1.addEmailController);
exports.default = router;
