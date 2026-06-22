import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType } from "zod";

export interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        // req.params / req.query are getters in Express 5, so redefine them.
        Object.defineProperty(req, "params", {
          value: schemas.params.parse(req.params),
          writable: true,
          configurable: true,
        });
      }
      if (schemas.query) {
        Object.defineProperty(req, "query", {
          value: schemas.query.parse(req.query),
          writable: true,
          configurable: true,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
