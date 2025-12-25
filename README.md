# Colobane Marketplace API

The robust backend core for the Colobane Marketplace, built with **Node.js**, **Express**, and **TypeScript**. It follows a clean architecture approach, separating business logic (use cases) from infrastructure (database, third-party services).

## 🚀 Core Features

### 🛒 E-commerce Engine
- **Product Management**: Category-based products with brand ownership, stock tracking, and advanced search/filtering.
- **Order System**: Multi-seller cart processing, order status management, and automated tax/fee calculations.
- **Promotions**: Coupon code management with validity checks and automatic discount application.

### 💳 Payments & Reconciliation
- **Multiple Providers**: Support for **Wave**, **Orange Money**, and **Cash on Delivery**.
- **Automated Reconciliation**: Background workers monitor payment statuses and notify admins of failures via Webhooks.
- **Finances & Payouts**: Precise tracking of seller commissions, platform fees, and payout history.

### 🔔 Notifications & Communications
- **Push Notifications**: Integrated with **Expo Push** to keep users updated on order status and marketing alerts.
- **Email Service**: Powered by **Resend** for transactional emails (order confirmations, security alerts).
- **In-app Alerts**: Real-time notification system for users and administrative staff.

### 🛡️ Security & Performance
- **Role-Based Access Control (RBAC)**: Strict permission levels for Customers, Sellers, Admin, and Deliverers.
- **JWT Authentication**: Secure stateless authentication with customizable token expiration.
- **Rate Limiting**: Protects against brute-force and DDoS at various levels via Redis-backed rate limiters.
- **Audit Logging**: Mandatory logging for sensitive administrative actions (product toggles, user blocking).

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Background Jobs**: [BullMQ](https://docs.bullmq.io/) (Redis)
- **API Documentation**: [Swagger/OpenAPI](https://swagger.io/)
- **Security**: [Helmet](https://helmetjs.github.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Monitoring**: [Sentry](https://sentry.io/)

## 📦 Getting Started

### Prerequisites
- Node.js (v24+)
- PostgreSQL Database
- Redis (Optional, required for background workers and advanced rate limiting)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/colobane"
   JWT_SECRET="your_secret_here"
   RESEND_API_KEY="re_..."
   ```
4. Setup Database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Run Services:
   - **API Server**: `npm run dev`
   - **Background Workers**: `npm run workers`

## 🏗️ Architecture

```text
src/
├── core/              # Business Logic (Pure TypeScript)
│   ├── usecases/      # Application specific business rules
│   ├── entities/      # Domain objects
│   └── services/      # Domain service interfaces (Email, Push)
├── infrastructure/    # External Concerns
│   ├── http/          # Express routes, controllers, middlewares
│   ├── prisma/        # Database client and schema
│   ├── email/         # Resend implementation
│   └── jobs/          # BullMQ Workers and Queues
└── server.ts          # Entry point
```

## 📄 Documentation
Once the server is running, visit `http://localhost:4000/docs` to view the interactive Swagger documentation.
