import { Router } from "express";
import {
  getMe,
  getUser,
  removeUser,
  updateUser,
} from "@/controllers/user.controller.ts";
import { validate } from "@/middleware/validation.ts";
import { adminHandler } from "@/middleware/adminHandler.ts";
import { attachUser, isAuthenticated } from "@/middleware/authenticate.ts";
import { UserParamsSchema, UserUpdateSchema } from "@/schemas/userSchemas.ts";

const router = Router();

router.get("/me", attachUser, isAuthenticated, getMe);
router.get("/admin", attachUser, isAuthenticated, adminHandler, getMe);
router.get("/:id", validate({ params: UserParamsSchema }), getUser);
router.patch(
  "/:id",
  validate({ params: UserParamsSchema, body: UserUpdateSchema }),
  updateUser,
);
router.delete("/:id", validate({ params: UserParamsSchema }), removeUser);

export default router;
