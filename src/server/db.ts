import { PrismaClient } from "~/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "~/env";

// In Prisma v7, the pg driver handles TLS (not the Rust engine).
// pg's connection-parameters.js merges parsed connectionString OVER config,
// so ssl options in config are overwritten. Appending sslmode=no-verify to
// the URL is the only reliable way to disable cert validation.
const connectionString = new URL(env.DATABASE_URL);
connectionString.searchParams.set("sslmode", "no-verify");

const adapter = new PrismaPg({
  connectionString: connectionString.toString(),
});

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
