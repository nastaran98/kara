import Link from "next/link"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { ArrowLeft, Layers } from "lucide-react"

import { auth } from "@/auth"
import { getAllCollections } from "@/server/repositories/collection.repo"

const Collections = async () => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const collections = await getAllCollections()

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[860px]">
        <Link
          href={`/${locale}/quotes`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" strokeWidth={1.6} />
          All quotes
        </Link>

        <header className="mb-7">
          <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-fg">
            Collections
          </h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            Quotes worth reviewing, gathered by theme or by book.
          </p>
        </header>

        {collections.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center rounded-lg border border-border bg-surface px-6 text-center shadow-[0_18px_50px_rgba(50,46,42,0.07)]">
            <p className="text-sm text-fg-muted">
              No collections available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/${locale}/quotes/collections/${collection.slug}`}
                className="flex flex-col rounded-lg border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(50,46,42,0.07)] transition hover:shadow-[0_22px_60px_rgba(50,46,42,0.1)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Layers className="size-4" strokeWidth={1.6} />
                  </div>
                  <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-fg">
                    {collection.title}
                  </h2>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-fg-muted">
                  {collection.description}
                </p>

                <p className="mt-4 text-xs text-fg-muted">
                  {collection.quotes.length} quote
                  {collection.quotes.length === 1 ? "" : "s"}
                </p>

                {collection.themeTags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {collection.themeTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Collections
