"use client"

import { useTransition } from "react"
import { useLocale } from "next-intl"
import { Check, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  addAllQuotesFromCollectionAction,
  addQuoteFromCollectionAction,
} from "@/server/actions/quote.actions"

export function AddCollectionQuoteButton({
  userId,
  quoteId,
  collectionSlug,
  alreadyAdded,
}: {
  userId: string
  quoteId: string
  collectionSlug: string
  alreadyAdded: boolean
}) {
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  if (alreadyAdded) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
        <Check className="size-3.5" strokeWidth={1.8} />
        Added
      </span>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-[8px]"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await addQuoteFromCollectionAction(
            locale,
            userId,
            quoteId,
            collectionSlug,
          )
        })
      }
    >
      <Plus className="size-3.5" strokeWidth={1.8} />
      Add
    </Button>
  )
}

export function AddAllCollectionQuotesButton({
  userId,
  quoteIds,
  collectionSlug,
}: {
  userId: string
  quoteIds: string[]
  collectionSlug: string
}) {
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      className="rounded-[10px]"
      disabled={isPending || quoteIds.length === 0}
      onClick={() =>
        startTransition(async () => {
          await addAllQuotesFromCollectionAction(
            locale,
            userId,
            quoteIds,
            collectionSlug,
          )
        })
      }
    >
      {isPending ? "Adding…" : "Add all"}
    </Button>
  )
}
