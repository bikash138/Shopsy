import { z } from "zod";
import { addressSchema } from "./auth.validation.ts";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    address: addressSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
