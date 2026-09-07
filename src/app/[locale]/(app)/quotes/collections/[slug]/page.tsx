import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/auth"
import { getCollectionBySlug } from "@/server/repositories/collection.repo"
import {
  AddAllCollectionQuotesButton,
  AddCollectionQuoteButton,
} from "@/components/collectionQuoteActions"

type PageProps = {
  params: Promise<{ slug: string }>
}

const CollectionDetail = async ({ params }: PageProps) => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const userId = session.user.id
  const { slug } = await params
  const collection = await getCollectionBySlug(slug, userId)

  if (!collection) {
    notFound()
  }

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[720px]">
        <Link
          href={`/${locale}/quotes/collections`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" strokeWidth={1.6} />
          Collections
        </Link>

        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-fg">
              {collection.title}
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-6 text-fg-muted">
              {collection.description}
            </p>
          </div>

          <AddAllCollectionQuotesButton
            userId={userId}
            collectionSlug={collection.slug}
            quoteIds={collection.quotes.map((quote) => quote.id)}
          />
        </header>

        <ul className="space-y-3">
          {collection.quotes.map((quote) => (
            <li
              key={quote.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface px-5 py-4 shadow-[0_12px_36px_rgba(50,46,42,0.05)]"
            >
              <div className="min-w-0">
                <p className="font-display text-base leading-6 text-fg">
                  “{quote.text}”
                </p>
                {(quote.author || quote.sourceTitle) && (
                  <p className="mt-2 text-xs text-fg-muted">
                    {[quote.author, quote.sourceTitle]
                      .filter(Boolean)
                      .join(" — ")}
                  </p>
                )}
              </div>

              <div className="shrink-0 pt-0.5">
                <AddCollectionQuoteButton
                  userId={userId}
                  quoteId={quote.id}
                  collectionSlug={collection.slug}
                  alreadyAdded={quote.quoteCards.length > 0}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

export default CollectionDetail
