import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./infrastructure/http/routes/authRoutes.ts";
import brandRoutes from "./infrastructure/http/routes/brandRoutes.ts";
import productRoutes from "./infrastructure/http/routes/productRoutes.ts";
import orderRoutes from "./infrastructure/http/routes/orderRoutes.ts";
import { pool } from "./config/db.ts";
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "./docs/swagger.ts";
import adminRoutes from "./infrastructure/http/routes/adminRoutes.ts";
import categoryRoutes from "./infrastructure/http/routes/categoryRoutes.ts";
import paymentRoutes from "./infrastructure/http/routes/paymentRoutes.ts";
import sellerDashboardRoutes from "./infrastructure/http/routes/sellerDashboardRoutes.ts";
import notificationRoutes from "./infrastructure/http/routes/notificationRoutes.ts";
import deliveryRoutes from "./infrastructure/http/routes/deliveryRoutes.ts";
import searchRoutes from "./infrastructure/http/routes/searchRoutes.ts";
import promotionRoutes from "./infrastructure/http/routes/promotionRoutes.ts";
import uploadRoutes from "./infrastructure/http/routes/uploadRoutes.ts";
import pushRoutes from "./infrastructure/http/routes/pushRoutes.ts";
import { apiRateLimiter } from "./infrastructure/http/middlewares/rateLimitMiddleware.ts";
import { registerSchedulers } from "./infrastructure/jobs/schedulers.ts";


dotenv.config();
await registerSchedulers();
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
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

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
