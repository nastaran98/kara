import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { BookOpen, CalendarDays, Clock3, Layers, Sparkles } from 'lucide-react'

import { getAllJourneys } from '@/server/repositories/journey.repo'
import StartJourneyButton from '@/components/startJourneyButton'
import { auth } from '@/auth'

const kindIcon = {
  source: BookOpen,
  theme: Sparkles,
  pool: Layers,
} as const

const kindLabel = {
  source: 'From a book',
  theme: 'Theme journey',
  pool: 'Your pool',
} as const

const Library = async () => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const userId = session.user.id

  const journeys = await getAllJourneys(userId)

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[1080px]">
        <header className="mb-7">
          <h1
            className="
              font-display
              text-2xl
              font-medium
              tracking-[-0.02em]
              text-fg
            "
          >
            Library
          </h1>

          <p className="mt-1.5 text-sm text-fg-muted">
            Choose a journey to start practicing.
          </p>
        </header>

        {journeys.length === 0 ? (
          <div
            className="
              flex
              min-h-[40vh]
              items-center
              justify-center
              rounded-lg
              border border-border
              bg-surface
              px-6
              text-center
              shadow-[0_18px_50px_rgba(50,46,42,0.07)]
            "
          >
            <p className="text-sm text-fg-muted">
              No journeys available yet.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            {journeys.map((journey) => {
              const Icon = kindIcon[journey.kind]
              const status = journey.userJourneys?.[0]?.status

              return (
                <div
                  key={journey.id}
                  className="
                    flex
                    flex-col
                    overflow-hidden
                    rounded-lg
                    border border-border
                    bg-surface
                    shadow-[0_18px_50px_rgba(50,46,42,0.07)]
                    transition
                    hover:shadow-[0_22px_60px_rgba(50,46,42,0.1)]
                  "
                >
                  {/* Header */}
                  <div
                    className="
                      flex
                      items-start
                      gap-4
                      border-b
                      border-border
                      px-6
                      py-6
                    "
                  >
                    <div
                      className="
                        flex
                        size-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-accent
                        text-accent-fg
                      "
                    >
                      <Icon className="size-5" strokeWidth={1.6} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-[0.08em]
                          text-accent
                        "
                      >
                        {kindLabel[journey.kind]}
                      </p>

                      <h2
                        className="
                          mt-1.5
                          truncate
                          font-display
                          text-lg
                          font-medium
                          tracking-[-0.02em]
                          text-fg
                        "
                      >
                        {journey.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col px-6 py-6">
                    {journey.outcomeStatement && (
                      <p className="line-clamp-3 text-sm leading-6 text-fg-muted">
                        {journey.outcomeStatement}
                      </p>
                    )}

                    {journey.sourceTitle && (
                      <p className="mt-3 text-xs text-fg-muted">
                        Drawn from{' '}
                        <span className="text-fg">
                          {journey.sourceTitle}
                        </span>
                        {journey.sourceAuthor
                          ? ` — ${journey.sourceAuthor}`
                          : ''}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-5 text-fg-muted">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          className="size-4"
                          strokeWidth={1.6}
                        />
                        <span className="text-xs">
                          {journey.totalDays} days
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 className="size-4" strokeWidth={1.6} />
                        <span className="text-xs">
                          ≈ {journey.dailyMinutes} min/day
                        </span>
                      </div>
                    </div>

                    {journey.themeTags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {journey.themeTags.map((tag) => (
                          <span
                            key={tag}
                            className="
                              rounded-full
                              bg-accent/10
                              px-2.5
                              py-1
                              text-[11px]
                              font-medium
                              text-accent
                            "
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 flex-1" />

                    <StartJourneyButton
                      userId={userId}
                      journeyId={journey.id}
                      status={status}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default Library
