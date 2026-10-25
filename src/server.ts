import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";
import { env, isTest } from "../env.ts";
import cookieParser from "cookie-parser";
import type { Request, Response } from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.ts";

// ROUTES
import authRoutes from "@/routes/auth.routes.ts";
import userRoutes from "@/routes/user.routes.ts";

const app = express();

app.use(helmet()); // Security headers
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("dev", {
    skip: () => isTest(),
  }),
);
app.use(cookieParser());

// HEALTH CHECK
app.get("/health", (_: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Passport Auth API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;
