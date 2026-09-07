import {
  addQuoteSchema,
  addQuotesBulkSchema,
  type AddQuoteInput,
  type AddQuotesBulkInput,
} from "@/lib/quoteSchema"
import {
  createPersonalQuoteAndCard,
  createPersonalQuotesAndCards,
} from "@/server/repositories/quote.repo"
import { tomorrow } from "@/server/services/quoteDates"

// validate → createPersonalQuoteAndCard → { ok, id }. A quote with only
// `text` filled in saves successfully and lands in Box 1, due tomorrow.
export async function addQuote(userId: string, payload: AddQuoteInput) {
  const result = addQuoteSchema.safeParse(payload)

  if (!result.success) {
    return { ok: false as const, error: result.error.issues[0]?.message ?? "Invalid quote." }
  }

  const { quote } = await createPersonalQuoteAndCard(
    userId,
    result.data,
    tomorrow(),
  )

  return { ok: true as const, id: quote.id }
}

// KARA-40 — every parsed-and-confirmed quote becomes a Quote + QuoteCard
// pair in one transaction, so a bad row never saves half the batch.
export async function addQuotesBulk(
  userId: string,
  payload: AddQuotesBulkInput,
) {
  const result = addQuotesBulkSchema.safeParse(payload)

  if (!result.success) {
    return { ok: false as const, error: result.error.issues[0]?.message ?? "Invalid import." }
  }

  const created = await createPersonalQuotesAndCards(
    userId,
    result.data.quotes,
    tomorrow(),
  )

  return { ok: true as const, count: created.length }
}
