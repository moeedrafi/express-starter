import { PublicUser } from "@/schemas/authSchemas.ts";

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
