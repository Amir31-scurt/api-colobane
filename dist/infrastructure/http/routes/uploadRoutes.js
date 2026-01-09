"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadConfig_1 = require("../../files/uploadConfig");
const unifiedAuth_1 = require("../middlewares/unifiedAuth");
const router = express_1.default.Router();
// Fix syntax error and simplify role check
router.post("/:type", unifiedAuth_1.unifiedAuth, uploadConfig_1.upload.single("image"), (req, res, next) => {
    const { type } = req.params;
    // Auth check
    if (!req.user && !req.auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Role check logic
    if (type === 'avatar') {
        // Allow any authenticated user
        return next();
    }
    const userRole = req.user?.role || req.auth?.role;
    if (userRole === 'SELLER' || userRole === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ message: "Action reservée aux vendeurs" });
}, (req, res) => {
    // Multer S3 adds 'key' and 'location' to req.file
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
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
