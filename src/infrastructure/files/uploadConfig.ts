import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// R2 Configuration
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT) {
  console.error("❌ Missing Cloudflare R2 credentials/endpoint in .env");
  // Don't crash immediately on import, but this will fail later if used
}

const r2Config = {
  endpoint: process.env.R2_ENDPOINT || "",
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || ""
  }
};

const s3 = new S3Client(r2Config);

const bucketName = process.env.R2_BUCKET_NAME || "colobane-assets";

// Helper to determine folder based on type
const getFolder = (req: any) => {
  if (req.params.type === "variant") return "variants";
  if (req.params.type === "avatar") return "avatars";
  return "products";
};

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    // acl: "public-read", // Removed for R2 compatibility
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folder = getFolder(req);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      const fullPath = `${folder}/${uniqueName}`;
      cb(null, fullPath);
    }
  })
});
