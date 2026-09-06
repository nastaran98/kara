// One-off local script — not deployed, not a network-reachable endpoint.
// Prints a long-lived Bearer token for an existing user. The mobile app
// itself now gets its token through a real sign-in flow (see apps/mobile/
// auth.ts and src/app/[locale]/(auth)/mobile-bridge) — this is for ad-hoc
// testing of the API directly (curl, etc.) without going through that UI.
// Requires AUTH_SECRET to match whatever the deployed app verifies
// against — same value already in Vercel's env vars.
//
// Usage: pnpm mint-test-token someone@example.com

import { config } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { signMobileToken } from "../src/server/auth/mobileToken";

config({ path: ".env.local" });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: pnpm mint-test-token <email>");
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(
      `No user found for ${email}. Sign in once via the web app's magic-link login first, then re-run this.`,
    );
    process.exitCode = 1;
    return;
  }

  // 180 days — long-lived on purpose, per the POC decision to skip
  // building mobile sign-in UI for v0.
  const token = await signMobileToken(user.id, "180d");

  console.log(token);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
