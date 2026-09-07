import Link from "next/link"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { BookOpen, Layers, Sparkles } from "lucide-react"

import { auth } from "@/auth"
import {
  countDueQuoteCards,
  getUserQuotes,
  type QuoteFilters,
} from "@/server/repositories/quote.repo"
import { isQuoteCardReady } from "@kara/domain"
import type { QuoteSourceType } from "@/generated/prisma/client"
import { AddQuoteButton } from "@/components/addQuoteDialog"
import { QuoteFilterBar } from "@/components/quoteFilterBar"
import { QuoteBoxDots } from "@/components/quoteBoxDots"
import { Badge } from "@/components/ui/badge"

const SOURCE_TYPES: QuoteSourceType[] = [
  "book",
  "fiction",
  "film",
  "podcast",
  "talk",
  "person",
  "unknown",
]

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): QuoteFilters {
  const theme = searchParams.theme
  const source = searchParams.source
  const origin = searchParams.origin
  const ready = searchParams.ready

  const themeTags =
    typeof theme === "string" ? theme.split(",").filter(Boolean) : undefined

  const sourceType =
    typeof source === "string" &&
    SOURCE_TYPES.includes(source as QuoteSourceType)
      ? (source as QuoteSourceType)
      : undefined

  const originFilter =
    origin === "mine" || origin === "collection" ? origin : undefined

  return {
    themeTags,
    sourceType,
    origin: originFilter,
    readyOnly: ready === "1",
  }
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const Quotes = async ({ searchParams }: PageProps) => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const userId = session.user.id
  const resolvedSearchParams = await searchParams
  const filters = parseFilters(resolvedSearchParams)

  const [allQuotes, filteredQuotes, dueCount] = await Promise.all([
    getUserQuotes(userId),
    getUserQuotes(userId, filters),
    countDueQuoteCards(userId),
  ])

  const availableThemeTags = [
    ...new Set(allQuotes.flatMap((card) => card.quote.themeTags)),
  ].sort()

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[1080px]">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-fg">
              Quotes
            </h1>
            <p className="mt-1.5 text-sm text-fg-muted">
              Everything you&apos;ve kept. Reviewing lives elsewhere — this
              is just for browsing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/quotes/collections`}
              className="
                inline-flex h-9 items-center gap-1.5 rounded-[10px]
                border border-border bg-surface px-3 text-sm text-fg-muted
                transition hover:text-fg
              "
            >
              <Layers className="size-4" strokeWidth={1.6} />
              Collections
            </Link>
            <AddQuoteButton userId={userId} />
          </div>
        </header>

        {dueCount > 0 && (
          <Link
            href={`/${locale}/quotes/review`}
            className="
              mb-6 flex items-center justify-between gap-3 rounded-lg
              border border-accent/20 bg-accent/10 px-5 py-4
              transition hover:bg-accent/15
            "
          >
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-accent" strokeWidth={1.6} />
              <p className="text-sm text-fg">
                <span className="font-medium text-accent">
                  {dueCount} quote{dueCount === 1 ? "" : "s"}
                </span>{" "}
                ready — about a minute
              </p>
            </div>
            <span className="text-xs font-medium text-accent">Review →</span>
          </Link>
        )}

        <div className="flex flex-col gap-6 md:flex-row">
          <QuoteFilterBar availableThemeTags={availableThemeTags} />

          <div className="min-w-0 flex-1">
            {filteredQuotes.length === 0 ? (
              <div
                className="
                  flex min-h-[30vh] items-center justify-center rounded-lg
                  border border-border bg-surface px-6 text-center
                  shadow-[0_18px_50px_rgba(50,46,42,0.07)]
                "
              >
                <p className="text-sm text-fg-muted">
                  {allQuotes.length === 0
                    ? "No quotes yet — add one to start your collection."
                    : "No quotes match these filters."}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredQuotes.map((card) => {
                  const ready = isQuoteCardReady(card.clearedCount)
                  const isMine = card.quote.userId === userId

                  return (
                    <li key={card.id}>
                      <Link
                        href={`/${locale}/quotes/${card.id}`}
                        className="
                          block rounded-lg border border-border bg-surface
                          px-5 py-4 shadow-[0_12px_36px_rgba(50,46,42,0.05)]
                          transition hover:shadow-[0_16px_44px_rgba(50,46,42,0.08)]
                        "
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-display text-base leading-6 text-fg">
                            “{card.quote.text}”
                          </p>

                          {ready && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-accent/30 text-accent"
                            >
                              Ready
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-muted">
                          {(card.quote.author || card.quote.sourceTitle) && (
                            <span className="flex items-center gap-1.5">
                              <BookOpen
                                className="size-3.5"
                                strokeWidth={1.6}
                              />
                              {[card.quote.author, card.quote.sourceTitle]
                                .filter(Boolean)
                                .join(" — ")}
                            </span>
                          )}

                          <span>{isMine ? "Mine" : "From a collection"}</span>

                          <QuoteBoxDots box={card.box} />
                        </div>

                        {card.quote.themeTags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {card.quote.themeTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Quotes
