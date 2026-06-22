import mongoose from "mongoose";
import { env } from "./env.ts";

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}
