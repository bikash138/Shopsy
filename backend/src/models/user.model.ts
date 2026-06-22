import { Schema, model, type InferSchemaType } from "mongoose";

const addressSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt hash — never store plaintext
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["seller", "customer"],
      default: "customer",
      required: true,
    },
    address: {
      type: addressSchema,
      default: undefined,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model("User", userSchema);
