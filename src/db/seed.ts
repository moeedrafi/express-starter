import { users } from "./schema.ts";
import { db } from "./connection.ts";

const seed = async () => {
  console.log("🌱 Starting database seed....");

  try {
    console.log("Clearing existing data....");
    await db.delete(users);

    console.log("creating demo users...");
    const [demoUser] = await db
      .insert(users)
      .values({
        email: "demo@app.com",
        password: "password",
        username: "demo",
      })
      .returning();

    console.log("✅ DB seeded successfully");
    console.log("user credentials:");
    console.log(`email: ${demoUser?.email}`);
    console.log(`username: ${demoUser?.username}`);
    console.log(`password: ${demoUser?.password}`);
  } catch (e) {
    console.error("❌ seed failed", e);
    process.exit(1);
  }
};

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
