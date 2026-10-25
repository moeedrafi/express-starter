import { z } from "zod";
import { rolesEnum } from "@/db/schema.ts";

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string(),
  password: z.string(),
  role: z.enum(rolesEnum.enumValues),
  refreshToken: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const UserParamsSchema = z.object({
  id: z.uuid(),
});

export type UserParams = z.infer<typeof UserParamsSchema>;

export const UserUpdateSchema = z.object({
  email: z.email().optional(),
  username: z.string().optional(),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;
