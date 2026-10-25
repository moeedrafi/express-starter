import type { NextFunction, Request, Response } from "express";
import { env } from "../../env.ts";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err.stack);

  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if ((err as { code?: string }).code === "23505") {
    status = 409;
    code = "CONFLICT";
    message = "Resource already exists";
  } else if ((err as { code?: string }).code === "23503") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid reference";
  }

  res.status(status).json({
    error: {
      message,
      code,
      ...(details ? { details } : {}),
      ...(env.APP_STAGE === "dev" && { stack: err.stack }),
    },
  });
};

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new NotFoundError(`Not found - ${req.originalUrl}`));
}
