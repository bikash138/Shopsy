import { z } from "zod";
import { objectId } from "./common.validation.ts";

export const addCartItemSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  // 0 (or less) removes the item from the cart
  quantity: z.coerce.number().int(),
});

// `:productId` route param for cart item operations.
export const cartItemParamSchema = z.object({ productId: objectId });

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
