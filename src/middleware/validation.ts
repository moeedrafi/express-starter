import z, { ZodError } from "zod";
import { ValidationError } from "./errorHandler.ts";
import type { NextFunction, Request, Response } from "express";

type ValidationOptions = {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
};

export const validate = (schemas: ValidationOptions) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const validatedBody = schemas.body.parse(req.body);
        req.body = validatedBody as Request["body"];
      }

      if (schemas.params) {
        const validatedParams = schemas.params.parse(req.params);
        req.params = validatedParams as Request["params"];
      }

      if (schemas.query) {
        const validatedQuery = schemas.query.parse(req.params);
        req.query = validatedQuery as Request["query"];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new ValidationError(
            "Validation failed",
            error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          ),
        );
      }

      next(error);
    }
  };
};
