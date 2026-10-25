import { UnauthorizedError } from "./errorHandler.ts";
import type { NextFunction, Request, Response } from "express";

export const adminHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new UnauthorizedError("Unauthorized"));
  }

  if (req.user.role !== "admin") {
    return next(new UnauthorizedError("Unauthorized"));
  }

  next();
};
