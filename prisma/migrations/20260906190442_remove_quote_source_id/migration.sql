-- Reverts the sourceId column added in 20260906185527_add_quote_source_id.
-- Seeded content instead uses Quote.id directly as its stable identifier
-- (e.g. "atomic-habits:01"), matching the convention already established
-- for this table's existing seeded rows.
DROP INDEX IF EXISTS "Quote_sourceId_key";
ALTER TABLE "Quote" DROP COLUMN IF EXISTS "sourceId";
