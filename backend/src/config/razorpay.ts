import Razorpay from "razorpay";
import crypto from "node:crypto";
import { env } from "./env.ts";
import { AppError } from "../utils/AppError.ts";

let client: Razorpay | null = null;

// Payments are only available when both keys are configured.
export function isPaymentsEnabled(): boolean {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret);
}

export function getRazorpay(): Razorpay {
  if (!isPaymentsEnabled()) {
    throw new AppError(503, "Payments are not configured");
  }
  if (!client) {
    client = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    });
  }
  return client;
}

// Verifies the Razorpay checkout signature (HMAC-SHA256 of "orderId|paymentId").
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  // Constant-time comparison (lengths must match first).
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
