import multer from "multer";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// R2 Configuration
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT) {
  console.error("❌ Missing Cloudflare R2 credentials/endpoint in .env");
  // Don't crash immediately on import, but this will fail later if used
}

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.R2_BUCKET_NAME || "colobane-assets";

// Helper to determine folder based on type
const getFolder = (req: any) => {
  const type = req.params.type;
  if (type === "variant") return "variants";
  if (type === "avatar") return "avatars";
  if (type === "product") return "products";
  if (type === "brand") return "brands";
  return type || "uploads";
};

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folder = getFolder(req);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      const fullPath = `${folder}/${uniqueName}`;
      cb(null, fullPath);
    }
  })
});

export async function uploadImage(
  file: Buffer,
  key: string,
  contentType: string
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_CDN_URL}/${key}`;
}
