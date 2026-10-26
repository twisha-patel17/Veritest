
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

try {
  await prisma.$connect();

  const userCount = await prisma.user.count();

  console.log("PostgreSQL connected successfully.");
  console.log("Current user count:", userCount);
} catch (error) {
  console.error("Database connection failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
