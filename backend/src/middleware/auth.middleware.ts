import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.ts";
import { AppError } from "../utils/AppError.ts";

// Augment Express Request with the authenticated user.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verifies the Bearer token (or auth cookie) and attaches req.user.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = bearer ?? req.cookies?.token;

  if (!token) {
    throw new AppError(401, "Authentication required");
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}

// Restricts a route to one or more roles. Use after authenticate.
export function authorize(...roles: Array<"seller" | "customer">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, "You do not have permission to access this resource");
    }
    next();
  };
}
