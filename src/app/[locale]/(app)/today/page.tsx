import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import {
  CalendarDays,
  Clock3,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";

import { auth } from "@/auth";
import { CompletePracticeButton } from "@/components/completePracticeButton";
import { Button } from "@/components/ui/button";
import {
  getCurrentPhase,
  getToday,
} from "@kara/domain";
import { getTodayState } from "@/server/services/getTodayState";
import { countDueQuoteCards } from "@/server/repositories/quote.repo";

const practiceLabels = {
  ACT: "Acceptance & Commitment Therapy",
  SIT: "Sitting practice",
  NOTICE: "Awareness practice",
  KEEP: "Habit practice",
} as const;

export default async function TodayPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const userId = session.user.id;

  const state = await getTodayState(userId);

  if (!state) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-medium text-fg">
            No active journey
          </h1>

          <p className="mt-2 text-sm text-fg-muted">
            Choose a journey to start practicing.
          </p>
        </div>
      </main>
    );
  }

  const today = getToday({
    hadActivityToday: state.hadActivityToday,
    practice: state.practice,
  });

  const currentPhase = getCurrentPhase(
    state.currentIndex,
    state.phases
  );

  if (today.dayState === "satisfied") {
    // KARA-43: the only prompt that's allowed to exist. Quotes are a
    // place, not an obligation — if nothing's due, nothing renders here,
    // no "all caught up" message either. Its absence is the whole point.
    const dueQuoteCount = await countDueQuoteCards(userId);

    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent/10">
            <Sprout className="size-5 text-accent" />
          </div>

          <h1 className="mt-5 text-2xl font-medium text-fg">
            Done for today
          </h1>

          <p className="mt-2 text-sm leading-6 text-fg-muted">
            You showed up. Your next practice will be here tomorrow.
          </p>

          {dueQuoteCount > 0 && (
            <Link
              href={`/${locale}/quotes/review`}
              className="mt-6 inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <Sparkles className="size-4" strokeWidth={1.6} />
              {dueQuoteCount} quote{dueQuoteCount === 1 ? "" : "s"} ready —
              about a minute
            </Link>
          )}
        </div>
      </main>
    );
  }

  if (!today.newPractice) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-fg-muted">
          No practice found.
        </p>
      </main>
    );
  }

  const totalPractices = state.phases.reduce(
    (sum, phase) =>
      sum + phase.endIndex - phase.startIndex + 1,
    0
  );

  const progressValue =
    totalPractices > 0
      ? Math.min(
          ((state.currentIndex - 1) / totalPractices) * 100,
          100
        )
      : 0;

  const currentDate = new Intl.DateTimeFormat(
    locale === "fa" ? "fa-IR" : "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date());

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <section
        className="
          w-full
          max-w-[1080px]
          overflow-hidden
          rounded-lg
          border border-border
          bg-surface
          shadow-[0_18px_50px_rgba(50,46,42,0.07)]
        "
      >
        {/* Journey header */}
        <header
          className="
            flex
            items-center
            justify-between
            gap-6
            border-b
            border-border
            px-7
            py-6
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
                bg-accent
                text-accent-fg
              "
            >
              <Sprout
                className="size-6"
                strokeWidth={1.6}
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  font-display
                  text-lg
                  font-medium
                  tracking-[-0.02em]
                  text-fg
                "
              >
                {state.journey.title}
              </h2>

              {state.journey.outcomeStatement && (
                <p className="mt-1 truncate text-sm text-fg-muted">
                  {state.journey.outcomeStatement}
                </p>
              )}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <CalendarDays
              className="size-5 text-fg-muted"
              strokeWidth={1.5}
            />

            <div>
              <p className="text-xs font-medium text-fg">
                Today
              </p>

              <p className="mt-0.5 text-xs text-fg-muted">
                {currentDate}
              </p>
            </div>
          </div>
        </header>

        {/* Main card body */}
        <div
          className="
            grid
            lg:grid-cols-[1.55fr_0.85fr]
          "
        >
          {/* LEFT — Practice */}
          <div
            className="
              flex
              flex-col
              px-7
              py-9
              md:px-10
              md:py-10
            "
          >
            {currentPhase && (
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  text-accent
                "
              >
                Phase {currentPhase.index} ·{" "}
                {currentPhase.name}
              </p>
            )}

            <h1
              className="
                mt-5
                max-w-[600px]
                font-display
                text-[clamp(2rem,3vw,2.8rem)]
                font-medium
                leading-[1.08]
                tracking-[-0.03em]
                text-fg
              "
            >
              {today.newPractice.title}
            </h1>

            <p
              className="
                mt-6
                max-w-[590px]
                text-base
                leading-7
                text-fg
              "
            >
              {today.newPractice.body}
            </p>

            {today.newPractice.minutes && (
              <div className="mt-7 flex items-center gap-2 text-accent">
                <Clock3
                  className="size-5"
                  strokeWidth={1.6}
                />

                <span className="text-sm">
                  ≈ {today.newPractice.minutes} min
                </span>
              </div>
            )}

            {/* Insight */}
            <div
              className="
                mt-9
                max-w-[450px]
                rounded-md
                bg-bg
                px-5
                py-4
              "
            >
              <div className="flex items-center gap-4">
                <Lightbulb
                  className="
                    size-5
                    shrink-0
                    text-accent
                  "
                  strokeWidth={1.6}
                />

                <div className="h-9 w-px bg-border" />

                <p className="text-xs leading-5 text-fg-muted">
                  Naming creates space. In that space,
                  you get to choose your next step.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Progress + actions */}
          <aside
            className="
              flex
              flex-col
              border-t
              border-border
              px-7
              py-9
              lg:border-s
              lg:border-t-0
            "
          >
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.08em]
                text-accent
              "
            >
              Practice progress
            </p>

            <p className="mt-4 text-xl text-fg">
              Practice{" "}
              <span className="text-accent">
                {state.currentIndex}
              </span>{" "}
              of {totalPractices}
            </p>

            {/* Progress bar */}
            <div
              className="
                mt-5
                h-3
                overflow-hidden
                rounded-full
                bg-border
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-accent
                  transition-[width]
                  duration-pill
                  ease-standard
                "
                style={{
                  width: `${progressValue}%`,
                }}
              />
            </div>

            <div className="my-8 h-px bg-border" />

            {/* Practice type */}
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  min-w-24
                  items-center
                  justify-center
                  rounded-full
                  bg-accent/10
                  px-5
                  py-2.5
                "
              >
                <span className="text-base font-medium text-accent">
                  {today.newPractice.type}
                </span>
              </div>

              <p className="max-w-40 text-xs leading-5 text-fg-muted">
                {
                  practiceLabels[
                    today.newPractice.type
                  ]
                }
              </p>
            </div>

            {/* Actions */}
            <div className="mt-9">
              <CompletePracticeButton
                userId={userId}
                userJourneyId={state.userJourneyId}
                practiceId={today.newPractice.id}
              />

              <Button
                type="button"
                variant="outline"
                className="
                  mt-3
                  h-12
                  w-full
                  rounded-md
                  border-border
                  bg-transparent
                  text-sm
                  font-medium
                  text-fg
                  shadow-none
                  hover:bg-bg
                "
              >
                Not today
              </Button>

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-fg-muted
                "
              >
                <ShieldCheck
                  className="size-4"
                  strokeWidth={1.5}
                />

                <span className="text-xs">
                  You can come back to it anytime.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}