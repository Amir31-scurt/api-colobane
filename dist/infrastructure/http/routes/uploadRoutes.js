"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadConfig_1 = require("../../files/uploadConfig");
const unifiedAuth_1 = require("../middlewares/unifiedAuth");
const requireRole_1 = require("../middlewares/auth/requireRole");
const router = express_1.default.Router();
router.post("/:type", // type = "product" ou "variant"
unifiedAuth_1.unifiedAuth, (0, requireRole_1.requireRole)("SELLER", "ADMIN"), uploadConfig_1.upload.single("image"), (req, res) => {
    // Multer S3 adds 'key' and 'location' to req.file
    const file = req.file;
    const cdnUrl = process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_CDN_URL;
    // If CDN is configured, use it, otherwise use the direct R2/S3 location
    const fileUrl = cdnUrl
        ? `${cdnUrl}/${file.key}`
        : file.location;
    return res.json({
        url: fileUrl
    });
});
exports.default = router;
