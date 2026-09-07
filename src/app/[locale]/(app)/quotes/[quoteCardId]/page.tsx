import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ArrowLeft, BookOpen } from "lucide-react"

import { auth } from "@/auth"
import { getUserQuoteCard } from "@/server/repositories/quote.repo"
import { isQuoteCardReady } from "@kara/domain"
import { QuoteDetailActions } from "@/components/quoteDetailActions"
import { QuoteBoxDots } from "@/components/quoteBoxDots"
import { Badge } from "@/components/ui/badge"

type PageProps = {
  params: Promise<{ quoteCardId: string }>
}

const QuoteDetail = async ({ params }: PageProps) => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const { quoteCardId } = await params
  const card = await getUserQuoteCard(session.user.id, quoteCardId)

  if (!card) {
    notFound()
  }

  const ready = isQuoteCardReady(card.clearedCount)
  const isMine = card.quote.userId === session.user.id

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[640px]">
        <Link
          href={`/${locale}/quotes`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" strokeWidth={1.6} />
          All quotes
        </Link>

        <div className="rounded-lg border border-border bg-surface p-8 shadow-[0_18px_50px_rgba(50,46,42,0.07)]">
          <div className="flex items-start justify-between gap-4">
            <QuoteBoxDots box={card.box} />
            {ready && (
              <Badge variant="outline" className="border-accent/30 text-accent">
                Ready
              </Badge>
            )}
          </div>

          <p className="mt-6 font-display text-2xl leading-[1.4] tracking-[-0.01em] text-fg">
            “{card.quote.text}”
          </p>

          {(card.quote.author || card.quote.sourceTitle) && (
            <p className="mt-5 flex items-center gap-2 text-sm text-fg-muted">
              <BookOpen className="size-4" strokeWidth={1.6} />
              {[card.quote.author, card.quote.sourceTitle]
                .filter(Boolean)
                .join(" — ")}
            </p>
          )}

          <p className="mt-1 text-xs text-fg-muted">
            {isMine ? "Your own quote" : "From a collection"}
          </p>

          {card.quote.themeTags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {card.quote.themeTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-7 border-t border-border pt-6">
            <QuoteDetailActions
              text={card.quote.text}
              author={card.quote.author}
              ready={ready}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default QuoteDetail
