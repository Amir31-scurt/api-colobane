import { Request, Response } from "express";

export const hello = (req: Request, res: Response) => {
  res.json({ message: "Welcome to your Node.js + TypeScript API! 🎉" });
};
