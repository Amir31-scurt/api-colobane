import rateLimit from "express-rate-limit";

// Global API rate limiter (300 requests / 15 minutes)
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requêtes / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Trop de requêtes, réessayez plus tard.",
  },
});

// Strict Auth rate limiter (anti-bruteforce, credential stuffing & bcrypt exhaustion DDoS)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 tentatives max / 15 min par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Trop de tentatives d'authentification. Veuillez patienter 15 minutes avant de réessayer.",
  },
});

// Sensitive OTP rate limiter (anti-SMS / email flood)
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requêtes OTP max / 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Trop de demandes d'OTP. Veuillez patienter 15 minutes.",
  },
});

// Search rate limiter (anti-DB exhaustion DDoS)
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 recherches max / minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Trop de recherches consécutives. Ralentissez un instant.",
  },
});

// AI Chat rate limiter (anti-quota exhaustion & spam on Gemini)
export const aiChatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages max par minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Kolu a reçu beaucoup de messages d'un coup ! Veuillez patienter un instant avant de renvoyer un message. ⏳",
  },
});
