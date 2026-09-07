import { z } from "zod"

// Mirrors the CreatePracticeInput pattern: a schema the add-quote service
// validates against before ever touching the repository. Nothing but
// `text` is required — per §6.3, an attributed quote is better than a
// lost one, but an unattributed one still beats nothing.
export const quoteSourceTypeSchema = z.enum([
  "book",
  "fiction",
  "film",
  "podcast",
  "talk",
  "person",
  "unknown",
])

export const addQuoteSchema = z.object({
  text: z.string().trim().min(1, "Enter the quote."),
  author: z.string().trim().min(1).optional(),
  sourceTitle: z.string().trim().min(1).optional(),
  sourceType: quoteSourceTypeSchema.default("unknown"),
  themeTags: z.array(z.string().trim().min(1)).default([]),
  note: z.string().trim().min(1).optional(),
})

export type AddQuoteInput = z.infer<typeof addQuoteSchema>

// KARA-40's bulk paste import — one candidate per blank-line-separated
// block, each independently editable on the confirm-the-split screen
// before it becomes a real Quote + QuoteCard pair.
export const addQuotesBulkSchema = z.object({
  quotes: z.array(addQuoteSchema).min(1, "Nothing to import."),
})

export type AddQuotesBulkInput = z.infer<typeof addQuotesBulkSchema>

// Splits a raw paste into candidate quotes on blank lines (KARA-40 step 1).
// Pure text transform — no validation here, that's the confirm screen's job.
export function splitPastedQuotes(raw: string): string[] {
  return raw
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
}
