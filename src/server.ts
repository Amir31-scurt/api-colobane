import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./infrastructure/http/routes/authRoutes";
import brandRoutes from "./infrastructure/http/routes/brandRoutes";
import productRoutes from "./infrastructure/http/routes/productRoutes";
import orderRoutes from "./infrastructure/http/routes/orderRoutes";
import { pool } from "./config/db";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import adminRoutes from "./infrastructure/http/routes/adminRoutes";
import categoryRoutes from "./infrastructure/http/routes/categoryRoutes";
import paymentRoutes from "./infrastructure/http/routes/paymentRoutes";
import sellerDashboardRoutes from "./infrastructure/http/routes/sellerDashboardRoutes";
import notificationRoutes from "./infrastructure/http/routes/notificationRoutes";
import deliveryRoutes from "./infrastructure/http/routes/deliveryRoutes";
import searchRoutes from "./infrastructure/http/routes/searchRoutes";
import promotionRoutes from "./infrastructure/http/routes/promotionRoutes";
import uploadRoutes from "./infrastructure/http/routes/uploadRoutes";
import pushRoutes from "./infrastructure/http/routes/pushRoutes";
import { apiRateLimiter } from "./infrastructure/http/middlewares/rateLimitMiddleware";
import { registerSchedulers } from "./infrastructure/jobs/schedulers";
import { prisma } from "./infrastructure/prisma/prismaClient";


dotenv.config();
// await registerSchedulers();
const app = express();
app.use(cors());
app.use(express.json());


app.get("/", async (_, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", message: "API Colobane TS opérationnelle" });
});


app.use(apiRateLimiter);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/seller", sellerDashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/push", pushRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "colobane-api",
    timestamp: new Date().toISOString()
  });
});


app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf.toString();
    }
  })
);


const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`🚀 Colobane TS backend running on http://localhost:${port}`)
);

prisma.$connect()
  .then(() => console.log("✅ Database connected"))
  .catch((err: any) => {
    console.error("❌ Database connection failed");
    console.error(err);
  });