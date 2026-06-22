import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  listProducts,
  getProductById,
  listCategories,
} from "../services/public/public.service.ts";

export const publicRouter = Router();

const listQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

publicRouter.get("/products", async (req: Request, res: Response) => {
  const params = listQuerySchema.parse(req.query);
  res.json(await listProducts(params));
});

publicRouter.get("/categories", async (_req: Request, res: Response) => {
  res.json(await listCategories());
});

publicRouter.get("/products/:id", async (req: Request, res: Response) => {
  res.json(await getProductById(req.params.id as string));
});
