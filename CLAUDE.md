# Kara

Bilingual (en/fa) daily-practice app. Next.js App Router, TypeScript,
Tailwind 4, Prisma + Neon Postgres.

## Commands
- `pnpm dev` / `pnpm build`
- `pnpm test:run` (Vitest, domain only) · `pnpm test:e2e` (Playwright)
- `pnpm lint` · `pnpm typecheck`
- `pnpm seed` — reads `content/`, idempotent

## Hard rules
- `src/domain/` is pure. No next, react, prisma, or `@/server/*` imports.
  ESLint enforces this; if a lint error says so, the design is wrong, not the rule.
- Logical properties only: `ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`. Never `pl-`/`text-left`.
- No red/destructive colour token exists. This is deliberate (§3.4, no shame mechanics).
- Tailwind 4: no `tailwind.config.ts`. Tokens go in the `@theme` block in `globals.css`.
- Prisma client generates to `src/generated/prisma`, not `@prisma/client`.
- Business logic goes in `src/server/services/` as plain async functions.
  Server Actions are three-line wrappers. Never put logic in an action body.
- Never import prisma in any file out of `src/server/repositories`
- `Link`/`usePathname` come from `@/i18n/navigation`, not `next/*`.

## Workflow
- Write the test first for anything in `src/domain/`.
- Don't run `prisma migrate` without asking.

## Design
- `PRODUCT.md` and `DESIGN.md` hold the design context (Impeccable).
  Read them before UI work.
- Where they conflict with the Hard rules above, the Hard rules win.
  Specifically: logical properties only, no red/destructive token,
  and tokens live in the `@theme` block, never a `tailwind.config.ts`.
- Any generated component must survive `/fa` in RTL, not just `/en`.