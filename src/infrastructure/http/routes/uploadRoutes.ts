import express from "express";
import path from "path";
import { upload } from "../../files/uploadConfig";
import { authRequired, isSeller } from "../middlewares/authMiddleware";

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

    const getPath = (type: string) => {
      if (type === "variant") return "variants";
      if (type === "avatar") return "avatars";
      return "products";
    };

    const fileUrl = `/uploads/${getPath(req.params.type)}/${req.file.filename}`;

    return res.json({
      url: fileUrl
    });
  }
);

export default router;
