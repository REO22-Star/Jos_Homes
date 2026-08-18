import { PrismaClient } from "@prisma/client";
import { isConfigured } from "@/env";

// Singleton Prisma client (avoids exhausting connections in dev hot-reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** True when a database is wired. Data functions fall back to demo data otherwise. */
export const hasDatabase = isConfigured.database;
