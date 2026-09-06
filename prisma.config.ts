import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    // Deliberately not prisma/config's `env()` helper: it throws when the
    // var is unset, which breaks `prisma generate` (part of every install,
    // via postinstall) in any environment without DB env vars configured —
    // this repo is a pnpm workspace, so e.g. an EAS Build for apps/mobile
    // installs the whole monorepo, root postinstall included, with no
    // reason to have DIRECT_URL set. `generate` never opens a connection,
    // so it doesn't need this to resolve — only migrate/db/studio/seed do,
    // and they fail with Prisma's own clear connection error if it's
    // genuinely missing when one of those actually runs.
    url: process.env.DIRECT_URL,
  },
});