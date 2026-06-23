import { z } from "zod";

// Validate and coerce environment variables once at startup.
// Bun loads .env automatically.
const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017/shopsy"),
  JWT_SECRET: z.string().min(1).default("dev-insecure-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Razorpay — optional; payment endpoints are disabled until both are set.
  RAZORPAY_KEY_ID: z.string().default(""),
  RAZORPAY_KEY_SECRET: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", z.treeifyError(parsed.error));
  throw new Error("Environment validation failed");
}

const data = parsed.data;

export const env = {
  port: data.PORT,
  mongoUri: data.MONGO_URI,
  jwtSecret: data.JWT_SECRET,
  jwtExpiresIn: data.JWT_EXPIRES_IN,
  nodeEnv: data.NODE_ENV,
  razorpayKeyId: data.RAZORPAY_KEY_ID,
  razorpayKeySecret: data.RAZORPAY_KEY_SECRET,
};
