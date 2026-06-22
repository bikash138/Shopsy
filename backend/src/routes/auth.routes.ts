import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { signup, signin } from "../services/auth/auth.service.ts";
import { authenticate } from "../middleware/auth.middleware.ts";
import { env } from "../config/env.ts";

export const authRouter = Router();

const addressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })
  .optional();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["seller", "customer"]).optional(),
  address: addressSchema,
});

const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// Sets the auth token as an httpOnly cookie (read back by cookie-parser).
function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

authRouter.post("/signup", async (req: Request, res: Response) => {
  const input = signupSchema.parse(req.body);
  const { user, token } = await signup(input);
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
});

authRouter.post("/signin", async (req: Request, res: Response) => {
  const input = signinSchema.parse(req.body);
  const { user, token } = await signin(input);
  setAuthCookie(res, token);
  res.json({ user, token });
});

authRouter.post("/signout", authenticate, (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Signed out" });
});

authRouter.get("/me", authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});
