"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailVerificationController_1 = require("../controllers/emailVerificationController");
const router = (0, express_1.Router)();
router.get("/verify-email", emailVerificationController_1.verifyEmailController);
exports.default = router;
