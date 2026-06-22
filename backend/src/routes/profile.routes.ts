import { Router, type Request, type Response } from "express";
import { getProfile, updateProfile } from "../services/profile/profile.service.ts";
import { authenticate } from "../middleware/auth.middleware.ts";
import { validate } from "../middleware/validate.ts";
import { updateProfileSchema, type UpdateProfileInput } from "../validators/index.ts";

export const profileRouter = Router();

// Profile endpoints are available to any authenticated user (seller or customer).
profileRouter.use(authenticate);

profileRouter.get("/", async (req: Request, res: Response) => {
  res.json(await getProfile(req.user!.sub));
});

profileRouter.patch(
  "/",
  validate({ body: updateProfileSchema }),
  async (req: Request<unknown, unknown, UpdateProfileInput>, res: Response) => {
    res.json(await updateProfile(req.user!.sub, req.body));
  }
);
