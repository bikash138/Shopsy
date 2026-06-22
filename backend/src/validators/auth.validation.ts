import { z } from "zod";

export const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.string().trim().optional(),
  })
  .optional();

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["seller", "customer"]).optional(),
  address: addressSchema,
});

export const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
