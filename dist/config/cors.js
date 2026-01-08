"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const allowedOrigins = [
    "http://localhost:8081", // Expo local
    "http://localhost:3000", // Expo local
    "http://localhost:19000", // Expo legacy
    "https://mycolobane.com",
    "https://admin.mycolobane.com",
    "https://www.mycolobane.com",
    "https://www.admin.mycolobane.com",
    "https://www.mycolobane.com",
];
exports.corsOptions = {
    origin: (origin, callback) => {
        // Autorise les requêtes sans origin (Postman, health check)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
    ],
};
