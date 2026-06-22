// Mirrors of the backend's request payloads and JSON responses.

export type Role = "seller" | "customer";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";
// Statuses a seller is allowed to set.
export type SellerOrderStatus = "processing" | "shipped" | "delivered";

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// --- Auth / user ---

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

// Returned by GET /auth/me (the decoded JWT payload).
export interface AuthSession {
  sub: string;
  role: Role;
}

// Full profile document (password hash is never included).
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: Role;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

// --- Products ---

export interface SellerRef {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  seller: SellerRef | string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductListResponse {
  items: Product[];
  pagination: Pagination;
}

// --- Cart ---

export interface CartItem {
  product: Product | string;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// --- Orders ---

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerRef {
  _id: string;
  name: string;
  email: string;
}

export interface Order {
  _id: string;
  customer: string | CustomerRef;
  products: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Request payloads ---

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
  address?: Address;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface ProductPayload {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export type UpdateProductPayload = Partial<ProductPayload>;

export interface UpdateProfilePayload {
  name?: string;
  address?: Address;
}

export interface ListProductsParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
