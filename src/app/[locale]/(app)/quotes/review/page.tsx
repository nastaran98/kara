import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"

import { auth } from "@/auth"
import { getDueQuoteCards } from "@/server/repositories/quote.repo"
import { QuoteReviewSession } from "@/components/quoteReviewSession"

const QuoteReview = async () => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const userId = session.user.id
  // The hard cap lives in the query (KARA-42) — the UI never has to trim.
  const cards = await getDueQuoteCards(userId, 7)

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[520px]">
        <QuoteReviewSession
          userId={userId}
          cards={cards.map((card) => ({
            id: card.id,
            box: card.box,
            quote: {
              text: card.quote.text,
              author: card.quote.author,
              sourceTitle: card.quote.sourceTitle,
              clozeWords: card.quote.clozeWords,
            },
          }))}
        />
      </div>
    </main>
  )
}

export default QuoteReview
