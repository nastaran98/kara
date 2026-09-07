"use server"

import { revalidatePath } from "next/cache"
import type { Grade } from "@kara/domain"
import { addQuote, addQuotesBulk } from "@/server/services/addQuote"
import {
  addAllQuotesFromCollection,
  addQuoteFromCollection,
} from "@/server/services/addQuoteFromCollection"
import { reviewQuoteCard } from "@/server/services/reviewQuoteCard"
import type { AddQuoteInput, AddQuotesBulkInput } from "@/lib/quoteSchema"

export async function addQuoteAction(
  locale: string,
  userId: string,
  payload: AddQuoteInput,
) {
  const result = await addQuote(userId, payload)

  if (result.ok) {
    revalidatePath(`/${locale}/quotes`)
  }

  return result
}

export async function addQuotesBulkAction(
  locale: string,
  userId: string,
  payload: AddQuotesBulkInput,
) {
  const result = await addQuotesBulk(userId, payload)

  if (result.ok) {
    revalidatePath(`/${locale}/quotes`)
  }

  return result
}

export async function addQuoteFromCollectionAction(
  locale: string,
  userId: string,
  quoteId: string,
  collectionSlug: string,
) {
  const result = await addQuoteFromCollection(userId, quoteId)

  revalidatePath(`/${locale}/quotes/collections/${collectionSlug}`)
  revalidatePath(`/${locale}/quotes`)

  return result
}

export async function addAllQuotesFromCollectionAction(
  locale: string,
  userId: string,
  quoteIds: string[],
  collectionSlug: string,
) {
  const result = await addAllQuotesFromCollection(userId, quoteIds)

  revalidatePath(`/${locale}/quotes/collections/${collectionSlug}`)
  revalidatePath(`/${locale}/quotes`)

  return result
}

// Grading doesn't revalidate the review page itself — KARA-42 requires
// that exiting mid-session keeps already-graded cards, and re-fetching the
// due queue after each grade would just reshuffle the batch the user is
// partway through. `/quotes` and `/today` (the due-count offer) do need to
// know the count changed.
export async function reviewQuoteCardAction(
  locale: string,
  userId: string,
  quoteCardId: string,
  grade: Grade,
) {
  const result = await reviewQuoteCard(userId, quoteCardId, grade)

  revalidatePath(`/${locale}/quotes`)
  revalidatePath(`/${locale}/today`)

  // Dates cross the server-action boundary as plain values in this app's
  // other actions too, but serialize explicitly here since the client
  // uses `dueAt` to compute the review summary's "next batch" date.
  return result.ok
    ? { ...result, dueAt: result.dueAt.toISOString() }
    : result
}
