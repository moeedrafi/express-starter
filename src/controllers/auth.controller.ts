import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

import { env } from "../../env.ts";
import { db } from "@/db/connection.ts";
import { users, type NewUser } from "@/db/schema.ts";

import { sendSuccess } from "@/utils/apiResponse.ts";
import { UserSchema } from "@/schemas/userSchemas.ts";
import { generateTokens, verifyRefreshToken } from "@/utils/jwt.ts";
import { comparePasswords, hashPassword } from "@/utils/password.ts";
import { publicUserSchema, type Login } from "@/schemas/authSchemas.ts";
import { ConflictError, UnauthorizedError } from "@/middleware/errorHandler.ts";

export const register = async (
  req: Request<{}, {}, NewUser>,
  res: Response,
) => {
  const { email, username, password } = req.body;

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    throw new ConflictError("User already exists");
  }

  const hashedPassword = await hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      username,
    })
    .returning();

  return sendSuccess(
    res,
    publicUserSchema.parse(newUser),
    "User created successfully",
    { status: 201 },
  );
};

export const login = async (req: Request<{}, {}, Login>, res: Response) => {
  const { email, password } = req.body;

  const [rawUser] = await db.select().from(users).where(eq(users.email, email));
  if (!rawUser) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const user = UserSchema.pick({
    id: true,
    email: true,
    password: true,
    role: true,
  }).parse(rawUser);

  const isValid = await comparePasswords(password, user.password);
  if (!isValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const hashedRefreshToken = await hashPassword(refreshToken);
  await db
    .update(users)
    .set({ refreshToken: hashedRefreshToken })
    .where(eq(users.id, user.id));

  return sendSuccess(
    res,
    publicUserSchema.parse(user),
    "Logged in successfully",
    { status: 201 },
  );
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  return sendSuccess(res, null, "Logged out successfully");
};

/*
Refresh both tokens and user doesn't have to login again
unless using after refresh token expiry => login
*/
export const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies["refresh_token"] as string | undefined;
  if (!oldRefreshToken) {
    throw new Error("Invalid Token");
  }

  // verify token
  const payload = await verifyRefreshToken(oldRefreshToken);

  // 2️⃣ fetch user + hashed refresh token
  const [user] = await db.select().from(users).where(eq(users.id, payload.id));
  if (!user || !user.refreshToken) {
    throw new UnauthorizedError();
  }

  // 3️⃣ compare hash
  const isValid = await comparePasswords(user.refreshToken, oldRefreshToken);
  if (!isValid) {
    throw new UnauthorizedError();
  }

  // 4️⃣ generate new tokens
  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // 5️⃣ hash new refresh token and save
  const hashedRefreshToken = await hashPassword(refreshToken);
  await db
    .update(users)
    .set({ refreshToken: hashedRefreshToken })
    .where(eq(users.id, user.id));

  // 6️⃣ return new tokens
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, null, "Tokens refreshed");
};

/*
only refresh access_token
if refresh_token expired => make user login
*/
export const refreshAccessToken = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies["refresh_token"] as string | undefined;
  if (!oldRefreshToken) {
    throw new UnauthorizedError("Invalid token");
  }

  const payload = await verifyRefreshToken(oldRefreshToken);

  const [user] = await db.select().from(users).where(eq(users.id, payload.id));
  if (!user || !user.refreshToken) {
    throw new UnauthorizedError();
  }

  const isValid = await comparePasswords(user.refreshToken, oldRefreshToken);
  if (!isValid) {
    throw new Error("Unauthorized");
  }

  const { accessToken } = await generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // 5️⃣ return new tokens
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, null, "Access Tokens refreshed");
};
