import { z } from "zod";
import { isValidObjectId } from "mongoose";

// A Mongo ObjectId supplied as a string (route params, body refs).
export const objectId = z
  .string()
  .refine((value) => isValidObjectId(value), { message: "Invalid id" });

// Reusable `:id` route param.
export const idParamSchema = z.object({ id: objectId });
