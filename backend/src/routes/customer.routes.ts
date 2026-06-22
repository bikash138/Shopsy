import { Router, type Request, type Response } from "express";
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
import { validate } from "../middleware/validate.ts";
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemParamSchema,
  idParamSchema,
  type AddCartItemInput,
  type UpdateCartItemInput,
} from "../validators/index.ts";

export const customerRouter = Router();

// Every customer route requires an authenticated user with the "customer" role.
customerRouter.use(authenticate, authorize("customer"));

// --- Cart ---

customerRouter.get("/cart", async (req: Request, res: Response) => {
  res.json(await getCart(req.user!.sub));
});

customerRouter.post(
  "/cart/items",
  validate({ body: addCartItemSchema }),
  async (req: Request<unknown, unknown, AddCartItemInput>, res: Response) => {
    const { productId, quantity } = req.body;
    res.json(await addToCart(req.user!.sub, productId, quantity));
  }
);

customerRouter.patch(
  "/cart/items/:productId",
  validate({ params: cartItemParamSchema, body: updateCartItemSchema }),
  async (req: Request<{ productId: string }, unknown, UpdateCartItemInput>, res: Response) => {
    res.json(await updateCartItem(req.user!.sub, req.params.productId, req.body.quantity));
  }
);

customerRouter.delete(
  "/cart/items/:productId",
  validate({ params: cartItemParamSchema }),
  async (req: Request<{ productId: string }>, res: Response) => {
    res.json(await removeFromCart(req.user!.sub, req.params.productId));
  }
);

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

customerRouter.get(
  "/orders/:id",
  validate({ params: idParamSchema }),
  async (req: Request<{ id: string }>, res: Response) => {
    res.json(await getCustomerOrderById(req.user!.sub, req.params.id));
  }
);
