import type { Types } from "mongoose";

export interface Product {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  /** the seller (User) who listed this product */
  seller: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
