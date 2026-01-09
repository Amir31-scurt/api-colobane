import express from "express";
import path from "path";
import { upload } from "../../files/uploadConfig";
import { unifiedAuth } from "../middlewares/unifiedAuth";
import { requireRole } from "../middlewares/auth/requireRole";

const router = express.Router();

// Fix syntax error and simplify role check
router.post(
  "/:type", 
  unifiedAuth,
  upload.single("image"),
  (req: any, res: any, next: any) => {
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
  },
  (req: any, res: any) => {
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
  }
);

export default router;
