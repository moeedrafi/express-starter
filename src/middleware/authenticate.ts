import { eq } from "drizzle-orm";
import { users } from "@/db/schema.ts";
import { db } from "@/db/connection.ts";
import { verifyAccessToken } from "@/utils/jwt.ts";
import { UnauthorizedError } from "./errorHandler.ts";
import { publicUserSchema } from "@/schemas/authSchemas.ts";
import type { Request, NextFunction, Response } from "express";

export const attachUser = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies["access_token"] as string;
    const { id } = await verifyAccessToken(accessToken);
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      throw new UnauthorizedError("User not authenticated");
    }

    req.user = publicUserSchema.parse(user);
    next();
  } catch (error) {
    next(new UnauthorizedError());
  }
};

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new UnauthorizedError("Unauthorized"));
  }

  next();
};
