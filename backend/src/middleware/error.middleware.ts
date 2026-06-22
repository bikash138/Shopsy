import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.ts";

// 404 handler for unmatched routes.
export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Global error handler. Express 5 forwards rejected async handlers here.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  // Duplicate key (e.g. email already registered)
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: "Resource already exists" });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}
