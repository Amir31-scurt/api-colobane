import type { Request, Response } from "express";
import { searchAllUsecase } from "../../../core/usecases/search/searchAll.ts";

export async function searchController(req: Request, res: Response) {
  const q = String(req.query.q || "");
  const result = await searchAllUsecase(q);
  return res.json(result);
}
