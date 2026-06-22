import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getSellerOrders,
} from "../services/seller-dashboard/seller.service.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";

export const sellerRouter = Router();

// Every seller route requires an authenticated user with the "seller" role.
sellerRouter.use(authenticate, authorize("seller"));

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  image: z.string().min(1),
});

const productUpdateSchema = productSchema.partial();

sellerRouter.get("/products", async (req: Request, res: Response) => {
  res.json(await getSellerProducts(req.user!.sub));
});

sellerRouter.post("/products", async (req: Request, res: Response) => {
  const input = productSchema.parse(req.body);
  res.status(201).json(await createProduct(req.user!.sub, input));
});

sellerRouter.patch("/products/:id", async (req: Request, res: Response) => {
  const updates = productUpdateSchema.parse(req.body);
  res.json(await updateProduct(req.user!.sub, req.params.id as string, updates));
});

sellerRouter.delete("/products/:id", async (req: Request, res: Response) => {
  await deleteProduct(req.user!.sub, req.params.id as string);
  res.status(204).end();
});

sellerRouter.get("/orders", async (req: Request, res: Response) => {
  res.json(await getSellerOrders(req.user!.sub));
});
