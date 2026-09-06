import { PrismaNeon } from "@prisma/adapter-neon";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

// Accepted by repository functions that must run inside a transaction
// (pass the callback's `tx`) as well as standalone (pass `prisma`).
export type Db = PrismaClient | Prisma.TransactionClient;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeon({
    connectionString,
  });

  return new PrismaClient({
    adapter,
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}