import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        phone: string;
      };
      auth?: {
        userId: number;
        role: "USER" | "SELLER" | "ADMIN";
      };
    }
  }
}

export {};
