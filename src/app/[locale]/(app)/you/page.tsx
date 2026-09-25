import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { ArrowRight, Sprout } from 'lucide-react'

import { auth } from '@/auth'
import { getProfileState } from '@/server/services/getProfileState'
import { SignOutButton } from '@/components/signOutButton'

const statusLabel = {
  active: 'In progress',
  completed: 'Completed',
  abandoned: 'Not finished',
  queued: 'Queued',
} as const

const You = async () => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const userId = session.user.id
  const { user, activeJourney, journeys, stats, streakMilestoneReachedToday } =
    await getProfileState(userId)

  const initials =
    (user?.name ?? user?.email ?? 'K')
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[1080px]">
        {/* Profile header */}
        <section
          className="
            flex
            flex-col
            gap-6
            overflow-hidden
            rounded-lg
            border border-border
            bg-surface
            px-7
            py-7
            shadow-card
            sm:flex-row
            sm:items-center
            sm:justify-between
            md:px-9
          "
        >
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="
                flex
                size-14
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-brass/40
                bg-brass
                font-mono
                text-lg
                font-bold
                text-brass-fg
              "
            >
              {initials}
            </div>

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  font-display
                  text-xl
                  font-medium
                  tracking-[-0.02em]
                  text-fg
                "
              >
                {user?.name || 'Your practice'}
              </h1>

              <p className="mt-1 truncate text-sm text-fg-muted">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="sm:w-48">
            <SignOutButton />
          </div>
        </section>

        {/* Stats — a ledger, not a grid of identical tiles: one card,
            one row per figure, numbers set in the citation mono. */}
        <h2 className="mt-8 text-sm font-medium text-fg">Your record</h2>

        <section className="mt-3 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          {(
            [
              { key: 'streak', label: 'Day streak', value: stats.streak, brass: true },
              {
                key: 'practices',
                label: 'Practices done',
                value: stats.practicesCompleted,
                brass: false,
              },
              {
                key: 'journeys',
                label: 'Journeys completed',
                value: stats.journeysCompleted,
                brass: false,
              },
              {
                key: 'learnings',
                label: 'Learnings saved',
                value: stats.learningsSaved,
                brass: false,
              },
            ] as const
          ).map((row, index, rows) => {
            const isCelebrating = row.brass && streakMilestoneReachedToday

            return (
              <div
                key={row.key}
                className={`
                  flex
                  items-center
                  justify-between
                  gap-4
                  px-7
                  py-4
                  md:px-9
                  ${index < rows.length - 1 ? 'border-b border-border' : ''}
                `}
              >
                <p className="text-sm text-fg">{row.label}</p>

                <p
                  className={`
                    font-mono
                    text-lg
                    font-bold
                    ${row.brass ? 'text-brass' : 'text-fg'}
                    ${isCelebrating ? 'animate-streak-milestone' : ''}
                  `}
                >
                  {row.value}
                </p>
              </div>
            )
          })}
        </section>

        {/* Current journey */}
        {activeJourney && (
          <section
            className="
              mt-5
              flex
              items-center
              justify-between
              gap-6
              overflow-hidden
              rounded-lg
              border border-border
              bg-surface
              px-7
              py-6
              shadow-card
              md:px-9
            "
          >
            <div className="flex min-w-0 items-center gap-4">
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
                <Sprout className="size-5" strokeWidth={1.6} />
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
                  Currently practicing
                </p>

                <h2
                  className="
                    mt-1
                    truncate
                    font-display
                    text-lg
                    font-medium
                    tracking-[-0.02em]
                    text-fg
                  "
                >
                  {activeJourney.journey.title}
                </h2>

                <p className="mt-1 text-xs text-fg-muted">
                  Day {activeJourney.currentIndex} of{' '}
                  {activeJourney.journey.totalDays}
                </p>
              </div>
            </div>

            <Link
              href={`/${locale}/today`}
              className="
                flex
                h-10
                shrink-0
                items-center
                gap-1.5
                rounded-md
                bg-accent
                px-4
                text-sm
                font-medium
                text-accent-fg
                shadow-accent
                hover:bg-accent/90
              "
            >
              Continue
              <ArrowRight className="size-4" strokeWidth={1.7} />
            </Link>
          </section>
        )}

        {/* Journey history */}
        <section className="mt-8">
          <h2 className="text-sm font-medium text-fg">Your journeys</h2>

          {journeys.length === 0 ? (
            <div
              className="
                mt-3
                flex
                min-h-[20vh]
                items-center
                justify-center
                rounded-lg
                border border-border
                bg-surface
                px-6
                text-center
                shadow-card
              "
            >
              <p className="text-sm text-fg-muted">
                You haven&apos;t started a journey yet.{' '}
                <Link
                  href={`/${locale}/library`}
                  className="font-medium text-accent hover:underline"
                >
                  Browse the library
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {journeys.map((userJourney) => (
                <div
                  key={userJourney.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-lg
                    border border-border
                    bg-surface
                    px-6
                    py-4
                    shadow-card
                  "
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">
                      {userJourney.journey.title}
                    </p>
                    <p className="mt-0.5 text-xs text-fg-muted">
                      Started{' '}
                      {new Intl.DateTimeFormat(
                        locale === 'fa' ? 'fa-IR' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      ).format(userJourney.startedAt)}
                    </p>
                  </div>

                  <span
                    className="
                      shrink-0
                      rounded-full
                      bg-accent/10
                      px-3
                      py-1
                      text-xs
                      font-medium
                      text-accent
                    "
                  >
                    {statusLabel[userJourney.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default You
