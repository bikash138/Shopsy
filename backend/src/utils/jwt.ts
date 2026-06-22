import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.ts";

export interface JwtPayload {
  sub: string; // user id
  role: "seller" | "customer";
}

// expiresIn comes from env as a plain string (e.g. "7d"); jsonwebtoken types
// it as a stricter template-literal union, so narrow it here.
const signOptions: SignOptions = {
  expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, signOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
