-- Reconciles migration history with a column that was already added
-- directly to the database outside of `prisma migrate` (drift detected
-- 2026-09-06). IF NOT EXISTS makes this safe to apply anywhere it hasn't
-- run yet, and a no-op where the column is already present.
ALTER TABLE "QuoteCard" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
