import { Router, type Request, type Response } from "express";
import { z } from "zod";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  placeOrder,
  getCustomerOrders,
  getCustomerOrderById,
} from "../services/customer-dashboard/customer.service.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";

export const customerRouter = Router();

// Every customer route requires an authenticated user with the "customer" role.
customerRouter.use(authenticate, authorize("customer"));

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int(),
});

// --- Cart ---

customerRouter.get("/cart", async (req: Request, res: Response) => {
  res.json(await getCart(req.user!.sub));
});

customerRouter.post("/cart/items", async (req: Request, res: Response) => {
  const { productId, quantity } = addItemSchema.parse(req.body);
  res.json(await addToCart(req.user!.sub, productId, quantity));
});

customerRouter.patch("/cart/items/:productId", async (req: Request, res: Response) => {
  const { quantity } = updateItemSchema.parse(req.body);
  res.json(await updateCartItem(req.user!.sub, req.params.productId as string, quantity));
});

customerRouter.delete("/cart/items/:productId", async (req: Request, res: Response) => {
  res.json(await removeFromCart(req.user!.sub, req.params.productId as string));
});

customerRouter.delete("/cart", async (req: Request, res: Response) => {
  await clearCart(req.user!.sub);
  res.status(204).end();
});

// --- Orders ---

customerRouter.post("/orders", async (req: Request, res: Response) => {
  res.status(201).json(await placeOrder(req.user!.sub));
});

customerRouter.get("/orders", async (req: Request, res: Response) => {
  res.json(await getCustomerOrders(req.user!.sub));
});

customerRouter.get("/orders/:id", async (req: Request, res: Response) => {
  res.json(await getCustomerOrderById(req.user!.sub, req.params.id as string));
});
