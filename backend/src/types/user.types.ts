export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export type UserRole = "seller" | "customer";

export interface User {
  name: string;
  email: string;
  /** bcrypt hash — never stored or returned as plaintext */
  password: string;
  role: UserRole;
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
}
