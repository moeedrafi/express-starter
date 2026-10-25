import z from "zod";
import { selectUserSchema } from "@/db/schema.ts";

export const loginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type Login = z.infer<typeof loginSchema>;

export const publicUserSchema = selectUserSchema.omit({
  password: true,
  createdAt: true,
  updatedAt: true,
  refreshToken: true,
});
export type PublicUser = z.infer<typeof publicUserSchema>;
