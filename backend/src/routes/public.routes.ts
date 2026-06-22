import { Router, type Request, type Response } from "express";
import {
  listProducts,
  getProductById,
  listCategories,
} from "../services/public/public.service.ts";
import { validate } from "../middleware/validate.ts";
import {
  listProductsQuerySchema,
  idParamSchema,
  type ListProductsQuery,
} from "../validators/index.ts";

export const publicRouter = Router();

publicRouter.get(
  "/products",
  validate({ query: listProductsQuerySchema }),
  async (req: Request<unknown, unknown, unknown, ListProductsQuery>, res: Response) => {
    res.json(await listProducts(req.query));
  }
);

publicRouter.get("/categories", async (_req: Request, res: Response) => {
  res.json(await listCategories());
});

publicRouter.get(
  "/products/:id",
  validate({ params: idParamSchema }),
  async (req: Request<{ id: string }>, res: Response) => {
    res.json(await getProductById(req.params.id));
  }
);
