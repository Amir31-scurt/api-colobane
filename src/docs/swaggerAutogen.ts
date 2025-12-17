import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const swaggerAutogen = require("swagger-autogen")();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sortie JSON générée
const outputFile = path.join(__dirname, "swagger-output.json");

// Point d’entrée à scanner (ton server qui monte toutes les routes)
const endpointsFiles = [path.join(process.cwd(), "src", "server.ts")];

const doc = {
  openapi: "3.0.0",
  info: {
    title: "Colobane API",
    description: "Documentation Swagger auto-générée — Colobane Backend (TypeScript)",
    version: "1.0.0"
  },
  servers: [
    { url: "http://localhost:4000", description: "Local" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth" },
    { name: "Brands" },
    { name: "Categories" },
    { name: "Products" },
    { name: "Orders" },
    { name: "Payments" },
    { name: "Delivery" },
    { name: "Notifications" },
    { name: "Admin" },
    { name: "Push" }
  ]
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  // eslint-disable-next-line no-console
  console.log("✅ Swagger généré:", outputFile);
});
