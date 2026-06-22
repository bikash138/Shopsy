import { Router, type Request, type Response } from "express";
import { signup, signin } from "../services/auth/auth.service.ts";
import { authenticate } from "../middleware/auth.middleware.ts";
import { validate } from "../middleware/validate.ts";
import {
  signupSchema,
  signinSchema,
  type SignupInput,
  type SigninInput,
} from "../validators/index.ts";
import { env } from "../config/env.ts";

export const authRouter = Router();

// Sets the auth token as an httpOnly cookie (read back by cookie-parser).
function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

authRouter.post(
  "/signup",
  validate({ body: signupSchema }),
  async (req: Request<unknown, unknown, SignupInput>, res: Response) => {
    const { user, token } = await signup(req.body);
    setAuthCookie(res, token);
    res.status(201).json({ user, token });
  }
);

authRouter.post(
  "/signin",
  validate({ body: signinSchema }),
  async (req: Request<unknown, unknown, SigninInput>, res: Response) => {
    const { user, token } = await signin(req.body);
    setAuthCookie(res, token);
    res.json({ user, token });
  }
);

authRouter.post("/signout", authenticate, (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Signed out" });
});

authRouter.get("/me", authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});
