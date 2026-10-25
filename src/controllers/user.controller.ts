import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

import { users } from "@/db/schema.ts";
import { db } from "@/db/connection.ts";
import { sendSuccess } from "@/utils/apiResponse.ts";
import { publicUserSchema } from "@/schemas/authSchemas.ts";
import { NotFoundError } from "@/middleware/errorHandler.ts";
import type { UserParams, UserUpdate } from "@/schemas/userSchemas.ts";

export const getMe = async (req: Request, res: Response) => {
  const user = req.user;

  return sendSuccess(res, user, "User fetched successfully");
};

export const getUser = async (req: Request<UserParams>, res: Response) => {
  const id = req.params.id;

  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return sendSuccess(
    res,
    publicUserSchema.parse(user),
    "User fetched successfully",
  );
};

export const updateUser = async (
  req: Request<UserParams, {}, UserUpdate>,
  res: Response,
) => {
  const id = req.params.id;
  const { email, username } = req.body;

  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  const updateUser = await db
    .update(users)
    .set({ email, username })
    .where(eq(users.id, id));

  if (updateUser.rowCount === 0) {
    throw new NotFoundError("User Not Updated");
  }

  return sendSuccess(
    res,
    publicUserSchema.parse(user),
    "User Updated Successfully",
  );
};

export const removeUser = async (req: Request<UserParams>, res: Response) => {
  const id = req.params.id;

  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  const deleteUser = await db.delete(users).where(eq(users.id, id));
  if (deleteUser.rowCount === 0) {
    throw new NotFoundError("User Not Deleted");
  }

  return sendSuccess(
    res,
    publicUserSchema.parse(user),
    "User Deleted Successfully",
  );
};
