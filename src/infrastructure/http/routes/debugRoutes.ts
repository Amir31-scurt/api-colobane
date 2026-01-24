import express from "express";

const router = express.Router();

router.get("/config", (req, res) => {
  const envVars = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    HAS_JWT_ACCESS_SECRET: !!process.env.JWT_ACCESS_SECRET,
    HAS_JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,
    HAS_JWT_SECRET: !!process.env.JWT_SECRET,
    JWT_ACCESS_SECRET_LEN: process.env.JWT_ACCESS_SECRET?.length || 0,
    DB_HOST: process.env.DB_HOST || "not set",
    DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + "..." : "not set",
  };

  res.json({
    status: "ok",
    message: "Debug Config",
    env: envVars
  });
});

export default router;
