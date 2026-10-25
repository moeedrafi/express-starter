import { db } from "../../src/db/connection.ts";
import { users } from "../../src/db/schema.ts";
import { generateTokens } from "../../src/utils/jwt.ts";
import { hashPassword } from "../../src/utils/password.ts";

export async function createTestUser(
  userData: Partial<{
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }> = {},
) {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    username: `testuser-${Date.now()}-${Math.random()}`,
    password: "TestPassword123!",
    ...userData,
  };

  const hashedPassword = await hashPassword(defaultData.password);
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create test user");
  }

  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
  });

  return { user, rawPassword: defaultData.password, accessToken, refreshToken };
}

export async function cleanupDatabase() {
  // Clean up in the right order due to foreign key constraints
  await db.delete(users);
}
