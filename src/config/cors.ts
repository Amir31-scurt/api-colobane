import { CorsOptions } from "cors";

const prodOrigins = [
  "https://mycolobane.com",
  "https://www.mycolobane.com",
  "https://admin.mycolobane.com",
  "https://www.admin.mycolobane.com",
];

const devOrigins = [
  "http://localhost:8081",  // Expo local
  "http://localhost:3000",  // Next.js local
  "http://localhost:3001",  // Admin local
  "http://localhost:19000", // Expo legacy
];

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? prodOrigins
    : [...prodOrigins, ...devOrigins];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Autorise les requêtes sans origin (Postman, health check)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked: ${origin} not allowed`)
    );
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
};
