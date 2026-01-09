"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.uploadImage = uploadImage;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// R2 Configuration
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT) {
    console.error("❌ Missing Cloudflare R2 credentials/endpoint in .env");
    // Don't crash immediately on import, but this will fail later if used
}
const s3 = new client_s3_1.S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});
const bucketName = process.env.R2_BUCKET_NAME || "colobane-assets";
// Helper to determine folder based on type
const getFolder = (req) => {
    const type = req.params.type;
    if (type === "variant")
        return "variants";
    if (type === "avatar")
        return "avatars";
    if (type === "product")
        return "products";
    if (type === "brand")
        return "brands";
    return type || "uploads";
};
exports.upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: bucketName,
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const folder = getFolder(req);
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path_1.default.extname(file.originalname)}`;
            const fullPath = `${folder}/${uniqueName}`;
            cb(null, fullPath);
        }
    })
});
async function uploadImage(file, key, contentType) {
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
    }));
    return `${process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_CDN_URL}/${key}`;
}
