import { Router, type Request, type Response } from "express";
import {
  createProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getSellerOrders,
} from "../services/seller-dashboard/seller.service.ts";
import { authenticate, authorize } from "../middleware/auth.middleware.ts";
import { validate } from "../middleware/validate.ts";
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "../validators/index.ts";

export const sellerRouter = Router();

// Every seller route requires an authenticated user with the "seller" role.
sellerRouter.use(authenticate, authorize("seller"));

sellerRouter.get("/products", async (req: Request, res: Response) => {
  res.json(await getSellerProducts(req.user!.sub));
});

sellerRouter.post(
  "/products",
  validate({ body: createProductSchema }),
  async (req: Request<unknown, unknown, CreateProductInput>, res: Response) => {
    res.status(201).json(await createProduct(req.user!.sub, req.body));
  }
);

sellerRouter.patch(
  "/products/:id",
  validate({ params: idParamSchema, body: updateProductSchema }),
  async (req: Request<{ id: string }, unknown, UpdateProductInput>, res: Response) => {
    res.json(await updateProduct(req.user!.sub, req.params.id, req.body));
  }
);

sellerRouter.delete(
  "/products/:id",
  validate({ params: idParamSchema }),
  async (req: Request<{ id: string }>, res: Response) => {
    await deleteProduct(req.user!.sub, req.params.id);
    res.status(204).end();
  }
);

sellerRouter.get("/orders", async (req: Request, res: Response) => {
  res.json(await getSellerOrders(req.user!.sub));
});
