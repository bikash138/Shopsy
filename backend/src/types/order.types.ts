import type { Types } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

/** A line item snapshotting the product at the time the order was placed. */
export interface OrderItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  customer: Types.ObjectId;
  products: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  // Razorpay references, set during the payment flow.
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
