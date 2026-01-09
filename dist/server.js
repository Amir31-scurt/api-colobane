"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./docs/swagger");
const prismaClient_1 = require("./infrastructure/prisma/prismaClient");
const cors_2 = require("./config/cors");
const rateLimit_1 = require("./config/rateLimit");
const globalErrorHandler_1 = require("./infrastructure/http/middlewares/globalErrorHandler");
const AppError_1 = require("./core/errors/AppError");
// Routes Imports
const authRoutes_1 = __importDefault(require("./infrastructure/http/routes/authRoutes"));
const brandRoutes_1 = __importDefault(require("./infrastructure/http/routes/brandRoutes"));
const productRoutes_1 = __importDefault(require("./infrastructure/http/routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./infrastructure/http/routes/orderRoutes"));
const adminRoutes_1 = __importDefault(require("./infrastructure/http/routes/adminRoutes"));
const categoryRoutes_1 = __importDefault(require("./infrastructure/http/routes/categoryRoutes"));
const paymentRoutes_1 = __importDefault(require("./infrastructure/http/routes/paymentRoutes"));
const sellerDashboardRoutes_1 = __importDefault(require("./infrastructure/http/routes/sellerDashboardRoutes"));
const notificationRoutes_1 = __importDefault(require("./infrastructure/http/routes/notificationRoutes"));
const deliveryRoutes_1 = __importDefault(require("./infrastructure/http/routes/deliveryRoutes"));
const searchRoutes_1 = __importDefault(require("./infrastructure/http/routes/searchRoutes"));
const promotionRoutes_1 = __importDefault(require("./infrastructure/http/routes/promotionRoutes"));
const uploadRoutes_1 = __importDefault(require("./infrastructure/http/routes/uploadRoutes"));
const pushRoutes_1 = __importDefault(require("./infrastructure/http/routes/pushRoutes"));
const emailRoutes_1 = __importDefault(require("./infrastructure/http/routes/emailRoutes"));
const publicRoutes_1 = __importDefault(require("./infrastructure/http/routes/publicRoutes"));
const favoriteRoutes_1 = __importDefault(require("./infrastructure/http/routes/favoriteRoutes"));
const contactRoutes_1 = __importDefault(require("./infrastructure/http/routes/contactRoutes"));
if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config();
}
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(rateLimit_1.apiRateLimiter);
// Webhook handling often requires raw body, but assuming express.json generic usage here. 
// If specific routes need raw body (like stripe), they should be mounted before this or handle it specifically.
app.use(express_1.default.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Root Route
app.get("/", async (_, res) => {
    await prismaClient_1.prisma.$connect()
        .then(() => console.log("✅ Database connected"))
        .catch((err) => {
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
app.use("/uploads", express_1.default.static("uploads"));
// API Routes
app.use("/api/upload", uploadRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/email", emailRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/brands", brandRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
app.use("/api/seller", sellerDashboardRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/delivery", deliveryRoutes_1.default);
app.use("/api/search", searchRoutes_1.default);
app.use("/api/promotions", promotionRoutes_1.default);
app.use("/api/push", pushRoutes_1.default);
app.use("/api/public", publicRoutes_1.default);
app.use("/api/favorites", favoriteRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
// Documentation
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// 404 Handler - Catch all other routes
app.use((req, res, next) => {
    next(new AppError_1.AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur !`, 404));
});
// Global Error Handler
app.use(globalErrorHandler_1.globalErrorHandler);
// Start Server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Colobane TS backend running on http://localhost:${port}`));
// DB Connection Check
prismaClient_1.prisma.$connect()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => {
    console.error("❌ Database connection failed");
    console.error(err);
});
