import { env } from "../../env.ts";
import { createSecretKey } from "crypto";
import type { UserRole } from "@/db/schema.ts";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface JwtPayload extends JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const generateTokens = async (payload: JwtPayload) => {
  const { email, ...accessPayload } = payload;
  const accessSecretKey = createSecretKey(env.JWT_SECRET, "utf-8");
  const refreshSecretKey = createSecretKey(env.REFRESH_TOKEN_SECRET, "utf-8");

  const accessToken = await new SignJWT(accessPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(accessSecretKey);

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES_IN)
    .sign(refreshSecretKey);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = async (token: string) => {
  const secretKey = createSecretKey(env.JWT_SECRET, "utf-8");

  const { payload } = await jwtVerify(token, secretKey);
  return payload as JwtPayload;
};

export const verifyRefreshToken = async (token: string) => {
  const secretKey = createSecretKey(env.REFRESH_TOKEN_SECRET, "utf-8");

  const { payload } = await jwtVerify(token, secretKey);
  return payload as JwtPayload;
};
