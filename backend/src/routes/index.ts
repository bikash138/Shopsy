import { Router } from "express";
import { authRouter } from "./auth.routes.ts";
import { sellerRouter } from "./seller.routes.ts";
import { customerRouter } from "./customer.routes.ts";
import { profileRouter } from "./profile.routes.ts";
import { publicRouter } from "./public.routes.ts";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/profile", profileRouter);
apiRouter.use("/seller", sellerRouter);
apiRouter.use("/customer", customerRouter);
apiRouter.use("/", publicRouter); // public catalog: /products, /categories
