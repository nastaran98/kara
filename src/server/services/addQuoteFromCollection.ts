import {
  addCardFromCollectionQuote,
  addCardsForCollectionQuotes,
} from "@/server/repositories/quote.repo"
import { tomorrow } from "@/server/services/quoteDates"

// The Quote row already exists (it belongs to a seeded Collection) —
// adding it to a user's deck creates exactly one new row: the QuoteCard.
export async function addQuoteFromCollection(userId: string, quoteId: string) {
  const quoteCard = await addCardFromCollectionQuote(
    userId,
    quoteId,
    tomorrow(),
  )

  return { ok: true as const, id: quoteCard.id }
}

// `[Add all]` on a collection — skips quotes the user already has a card
// for, so re-clicking it (or clicking it after adding one quote by hand)
// never creates a duplicate.
export async function addAllQuotesFromCollection(
  userId: string,
  quoteIds: string[],
) {
  const added = await addCardsForCollectionQuotes(
    userId,
    quoteIds,
    tomorrow(),
  )

  return { ok: true as const, count: added.length }
}
