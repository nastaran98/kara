"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { AnimatePresence, motion } from "motion/react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { reviewQuoteCardAction } from "@/server/actions/quote.actions"
import {
  getClozeSegments,
  selectClozeWords,
  shouldUseCloze,
  type Grade,
} from "@kara/domain"

type ReviewCard = {
  id: string
  box: number
  quote: {
    text: string
    author: string | null
    sourceTitle: string | null
    clozeWords: string[]
  }
}

// The opening fragment for a normal (non-cloze) reveal — enough to
// recognize the quote by, not the whole thing. Tap/space brings the rest
// in beneath it; the fragment itself never moves.
function openingFragment(text: string): { fragment: string; rest: string } {
  const words = text.split(/\s+/)
  const fragmentWordCount = Math.min(6, Math.max(3, Math.ceil(words.length / 4)))
  const fragment = words.slice(0, fragmentWordCount).join(" ")
  const rest = words.slice(fragmentWordCount).join(" ")
  return { fragment, rest }
}

function GradeButtons({
  onGrade,
  disabled,
}: {
  onGrade: (grade: Grade) => void
  disabled: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => onGrade("no")}
        className="h-11 rounded-[10px] border-border text-fg-muted hover:text-fg"
      >
        No
      </Button>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => onGrade("almost")}
        className="h-11 rounded-[10px] border-border text-fg-muted hover:text-fg"
      >
        Almost
      </Button>
      <Button
        disabled={disabled}
        onClick={() => onGrade("got_it")}
        className="h-11 rounded-[10px] bg-accent text-accent-fg hover:bg-accent/90"
      >
        Got it
      </Button>
    </div>
  )
}

function ReviewCardFace({ card }: { card: ReviewCard }) {
  const [revealed, setRevealed] = useState(false)

  const useCloze = shouldUseCloze(card.quote.text)
  const clozeWords = useMemo(
    () =>
      card.quote.clozeWords.length > 0
        ? card.quote.clozeWords
        : selectClozeWords(card.quote.text),
    [card.quote.text, card.quote.clozeWords],
  )

  if (useCloze) {
    const segments = getClozeSegments(card.quote.text, clozeWords)

    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="block w-full text-start"
        aria-pressed={revealed}
      >
        <p className="font-display text-2xl leading-[1.5] tracking-[-0.01em] text-fg">
          “
          {segments.map((segment, index) =>
            segment.isBlank ? (
              <span key={index} className="relative inline-block">
                <span
                  className={
                    revealed
                      ? "text-accent"
                      : "text-transparent"
                  }
                >
                  {segment.text}
                </span>
                {!revealed && (
                  <span className="absolute inset-x-0 bottom-1.5 h-[2px] bg-border" />
                )}
              </span>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
          ”
        </p>
        {!revealed && (
          <p className="mt-4 text-xs text-fg-muted">
            Tap to reveal the blanked words
          </p>
        )}
      </button>
    )
  }

  const { fragment, rest } = openingFragment(card.quote.text)

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="block w-full text-start"
      aria-pressed={revealed}
    >
      <p className="font-display text-2xl leading-[1.5] tracking-[-0.01em] text-fg">
        “{fragment}
        {revealed && rest ? ` ${rest}` : ""}”
      </p>

      <AnimatePresence>
        {!revealed && (
          <motion.p
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-xs text-fg-muted"
          >
            Tap to reveal the rest
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  )
}

export function QuoteReviewSession({
  cards,
  userId,
}: {
  cards: ReviewCard[]
  userId: string
}) {
  const locale = useLocale()
  const [index, setIndex] = useState(0)
  const [isGrading, setIsGrading] = useState(false)
  const [results, setResults] = useState<
    { movedUp: boolean; dueAt: Date }[]
  >([])

  const current = cards[index]
  const total = cards.length
  const done = index >= total

  async function handleGrade(grade: Grade) {
    if (!current) return
    setIsGrading(true)

    const result = await reviewQuoteCardAction(
      locale,
      userId,
      current.id,
      grade,
    )

    setIsGrading(false)

    if (result.ok) {
      setResults((prev) => [
        ...prev,
        { movedUp: grade === "got_it", dueAt: new Date(result.dueAt) },
      ])
    }

    setIndex((i) => i + 1)
  }

  if (total === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-fg-muted">Nothing due right now.</p>
      </div>
    )
  }

  if (done) {
    const movedUp = results.filter((r) => r.movedUp).length
    const soonest =
      results.length > 0
        ? new Date(
            Math.min(...results.map((r) => r.dueAt.getTime())),
          )
        : null

    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-medium text-fg">
          All done
        </h1>
        <p className="mt-3 text-sm leading-6 text-fg-muted">
          {results.length} reviewed · {movedUp} moved up
          {soonest && (
            <>
              {" "}
              · next batch{" "}
              {soonest.toLocaleDateString(undefined, {
                weekday: "long",
              })}
            </>
          )}
        </p>
        <Link
          href={`/${locale}/quotes`}
          className="mt-8 inline-flex h-10 items-center rounded-[10px] bg-accent px-5 text-sm font-medium text-accent-fg"
        >
          Back to quotes
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-between px-4 py-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-fg-muted">
          {index + 1} of {total}
        </span>
        <Link
          href={`/${locale}/quotes`}
          aria-label="Exit review"
          className="text-fg-muted hover:text-fg"
        >
          <X className="size-5" strokeWidth={1.6} />
        </Link>
      </div>

      <div className="my-10">
        <ReviewCardFace key={current.id} card={current} />

        {(current.quote.author || current.quote.sourceTitle) && (
          <p className="mt-6 text-xs text-fg-muted">
            {[current.quote.author, current.quote.sourceTitle]
              .filter(Boolean)
              .join(" — ")}
          </p>
        )}
      </div>

      <GradeButtons onGrade={handleGrade} disabled={isGrading} />
    </div>
  )
}
