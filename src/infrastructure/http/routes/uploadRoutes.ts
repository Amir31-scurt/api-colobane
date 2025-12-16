import express from "express";
import path from "path";
import { upload } from "../../files/uploadConfig.ts";
import { authRequired, isSeller } from "../middlewares/authMiddleware.ts";

const router = express.Router();

router.post(
  "/:type", // type = "product" ou "variant"
  authRequired,
  isSeller,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    const fileUrl = `/uploads/${req.params.type === "variant" ? "variants" : "products"}/${req.file.filename}`;
    
    return res.json({
      url: fileUrl
    });
  }
);

export default router;
