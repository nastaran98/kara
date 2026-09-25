import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Sparkles, Sprout } from "lucide-react";

import { auth } from "@/auth";
import { PracticeCard } from "@/components/practiceCard";
import {
  getCurrentPhase,
  getToday,
} from "@kara/domain";
import { getTodayState } from "@/server/services/getTodayState";
import { countDueQuoteCards } from "@/server/repositories/quote.repo";

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
    completedPractice: state.completedPractice,
  });

  // The card shows either the practice still waiting for today, or —
  // once the day is satisfied — the one that was just filed, so the
  // user keeps seeing what they did instead of a blank "come back
  // tomorrow" screen. Only a genuinely empty day falls through below.
  const cardPractice =
    today.dayState === "pending"
      ? today.newPractice
      : today.dayState === "satisfied"
        ? today.completedPractice
        : null;

  if (cardPractice) {
    const dayIndex = cardPractice.index ?? state.currentIndex;
    const currentPhase = getCurrentPhase(dayIndex, state.phases);

    const totalPractices = state.phases.reduce(
      (sum, phase) =>
        sum + phase.endIndex - phase.startIndex + 1,
      0
    );

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
        <PracticeCard
          userId={userId}
          userJourneyId={state.userJourneyId}
          practice={cardPractice}
          journeyTitle={state.journey.title}
          phaseLabel={
            currentPhase
              ? `Phase ${currentPhase.index} — ${currentPhase.name}`
              : null
          }
          dayIndex={dayIndex}
          totalPractices={totalPractices}
          currentDate={currentDate}
          initiallyDone={today.dayState === "satisfied"}
        />
      </main>
    );
  }

  if (today.dayState === "satisfied") {
    // KARA-43: the only prompt that's allowed to exist. Quotes are a
    // place, not an obligation — if nothing's due, nothing renders here,
    // no "all caught up" message either. Its absence is the whole point.
    // (Reached only when today's activity didn't come from a specific
    // practice — e.g. a quote review — so there's nothing to file here.)
    const dueQuoteCount = await countDueQuoteCards(userId);

    return (
      <main className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <Sprout
            className="mx-auto size-8 text-brass"
            strokeWidth={1.4}
          />

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

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-fg-muted">
        No practice found.
      </p>
    </main>
  );
}
