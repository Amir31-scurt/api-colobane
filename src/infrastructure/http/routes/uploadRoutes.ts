import express from "express";
import path from "path";
import { upload } from "../../files/uploadConfig";
import { unifiedAuth } from "../middlewares/unifiedAuth";
import { requireRole } from "../middlewares/auth/requireRole";

const router = express.Router();

router.post(
  "/:type", // type = "product" ou "variant"
  unifiedAuth,
  requireRole("SELLER", "ADMIN"),
  upload.single("image"),
  (req, res) => {
    // Multer S3 adds 'key' and 'location' to req.file
    const file = req.file as any;
    const cdnUrl = process.env.CLOUDFLARE_CDN_URL;

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
