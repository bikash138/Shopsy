import { z } from "zod";

// Statuses a seller may set while fulfilling an order.
export const updateOrderStatusSchema = z.object({
  status: z.enum(["processing", "shipped", "delivered"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
