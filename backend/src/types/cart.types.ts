import type { Types } from "mongoose";

export interface CartItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface Cart {
  user: Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
