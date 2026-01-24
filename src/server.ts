import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { prisma } from "./infrastructure/prisma/prismaClient";
import { corsOptions } from "./config/cors";
import { apiRateLimiter } from "./config/rateLimit";
import { globalErrorHandler } from "./infrastructure/http/middlewares/globalErrorHandler";
import { AppError } from "./core/errors/AppError";

// Routes Imports
import authRoutes from "./infrastructure/http/routes/authRoutes";
import brandRoutes from "./infrastructure/http/routes/brandRoutes";
import productRoutes from "./infrastructure/http/routes/productRoutes";
import orderRoutes from "./infrastructure/http/routes/orderRoutes";
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
import emailRoutes from "./infrastructure/http/routes/emailRoutes";
import publicRoutes from "./infrastructure/http/routes/publicRoutes";
import favoriteRoutes from "./infrastructure/http/routes/favoriteRoutes";
import contactRoutes from "./infrastructure/http/routes/contactRoutes";

if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}
const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(apiRateLimiter);

// Webhook handling often requires raw body, but assuming express.json generic usage here. 
// If specific routes need raw body (like stripe), they should be mounted before this or handle it specifically.
app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf.toString();
    }
  })
);

app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Route
app.get("/", async (_, res) => {
  await prisma.$connect()
    .then(() => console.log("✅ Database connected"))
    .catch((err: any) => {
      console.error("❌ Database connection failed");
      console.error(err);
    });
  res.json({ status: "ok", message: "API Colobane TS opérationnelle" });
});

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "colobane-api",
    timestamp: new Date().toISOString()
  });
});

// Static Files
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/upload", uploadRoutes);
app.use("/admin", adminRoutes);
app.use("/email", emailRoutes);
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
app.use("/api/public", publicRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/contact", contactRoutes);

// Debug Route (Temporary)
import debugRoutes from "./infrastructure/http/routes/debugRoutes";
app.use("/api/debug", debugRoutes);

// Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 Handler - Catch all other routes
app.use((req, res, next) => {
  next(new AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur !`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Start Server
const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`🚀 Colobane TS backend running on http://localhost:${port}`)
);

// DB Connection Check
prisma.$connect()
  .then(() => console.log("✅ Database connected"))
  .catch((err: any) => {
    console.error("❌ Database connection failed");
    console.error(err);
  });