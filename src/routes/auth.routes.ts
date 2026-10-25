import { Router } from "express";
import { insertUserSchema } from "@/db/schema.ts";
import { validate } from "@/middleware/validation.ts";
import { loginSchema } from "@/schemas/authSchemas.ts";
import {
  login,
  logout,
  refresh,
  register,
} from "@/controllers/auth.controller.ts";

const router = Router();

router.post("/login", validate({ body: loginSchema }), login);
router.post("/register", validate({ body: insertUserSchema }), register);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
