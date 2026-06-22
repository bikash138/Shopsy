import { Schema, model, type InferSchemaType } from "mongoose";

// snapshot of each line item at the time the order was placed
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // captured at purchase time so later price/name changes don't alter the order
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    products: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "An order must contain at least one product.",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      required: true,
    },
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel = model("Order", orderSchema);
