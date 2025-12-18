import { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:8081",          // Expo local
  "http://localhost:19000",         // Expo legacy
  "https://mycolobane.com",
  "https://www.mycolobane.com",
];

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
