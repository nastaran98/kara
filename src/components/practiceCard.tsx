"use client";

import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  Sparkle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/confettiBurst";
import { playClapSound } from "@/lib/clapSound";
import { completePracticeAction } from "@/server/actions/practice.actions";
import type { TodayPractice } from "@kara/domain";

const practiceLabels = {
  ACT: "Acceptance & Commitment Therapy",
  SIT: "Sitting practice",
  NOTICE: "Awareness practice",
  KEEP: "Habit practice",
} as const;

// The guide-tab colors, reusing the practice-type hues already in the
// design system — recast here as a filed citation-card tab rather than a
// flat icon chip.
const typeTabClasses = {
  ACT: "bg-act text-act-fg",
  SIT: "bg-sit text-sit-fg",
  NOTICE: "bg-notice text-notice-fg",
  KEEP: "bg-keep text-keep-fg",
} as const;

type PracticeCardProps = {
  userId: string;
  userJourneyId: string;
  practice: TodayPractice;
  journeyTitle: string;
  phaseLabel: string | null;
  dayIndex: number;
  totalPractices: number;
  currentDate: string;
  initiallyDone: boolean;
};

export function PracticeCard({
  userId,
  userJourneyId,
  practice,
  journeyTitle,
  phaseLabel,
  dayIndex,
  totalPractices,
  currentDate,
  initiallyDone,
}: PracticeCardProps) {
  const t = useTranslations("Practice");
  const locale = useLocale();

  // A card that's already filed on load starts turned to its back —
  // there's nothing left to build toward, so show the content straight
  // away. A fresh, undone card starts on its cover.
  const [flipped, setFlipped] = useState(initiallyDone);
  const [done, setDone] = useState(initiallyDone);
  const [justFiled, setJustFiled] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [celebrating, setCelebrating] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const sceneRef = useRef<HTMLDivElement>(null);

  const citation = [practice.sourceAuthor, practice.sourceTitle]
    .filter(Boolean)
    .join(", ");

  const file = () => {
    setFailed(false);
    // Optimistic: the stamp lands immediately, the network call trails
    // behind it. The user asked to see the card filed, not a spinner.
    setDone(true);
    setJustFiled(true);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reducedMotion) {
      const rect = sceneRef.current?.getBoundingClientRect();
      if (rect) {
        setConfettiOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height * 0.25,
        });
      }

      setCelebrating(true);
      playClapSound();
    }

    startTransition(async () => {
      try {
        await completePracticeAction(
          locale,
          userId,
          userJourneyId,
          practice.id
        );
      } catch {
        setDone(false);
        setJustFiled(false);
        setFailed(true);
        setCelebrating(false);
        setConfettiOrigin(null);
      }
    });
  };

  return (
    <div
      ref={sceneRef}
      className={`flip-scene w-full max-w-190 ${
        celebrating ? "animate-card-celebrate" : ""
      }`}
    >
      {confettiOrigin && (
        <ConfettiBurst
          originX={confettiOrigin.x}
          originY={confettiOrigin.y}
          onFinished={() => {
            setCelebrating(false);
            setConfettiOrigin(null);
          }}
        />
      )}

      <div
        className="flip-card w-full"
        data-flipped={flipped}
      >
        {/* FRONT — the cover: what today's practice is, not yet what it says */}
        <div className="flip-face flip-face-front">
          <button
            type="button"
            onClick={() => setFlipped(true)}
            aria-label={t("reveal")}
            className="
              flex
              w-full
              flex-col
              overflow-hidden
              rounded-lg
              border border-border
              bg-surface
              text-start
              shadow-card
              transition-shadow
              duration-pill
              ease-standard
              hover:shadow-card-hover
            "
          >
            <header
              className="
                flex
                w-full
                items-center
                justify-between
                gap-4
                border-b border-border
                px-7
                py-4
                md:px-10
              "
            >
              <p className="min-w-0 truncate text-xs text-fg-muted">
                {journeyTitle}
                {phaseLabel && ` · ${phaseLabel}`}
              </p>

              <p className="shrink-0 font-mono text-xs text-fg-muted">
                {currentDate}
              </p>
            </header>

            <div className="flex w-full flex-col items-center px-7 py-14 text-center md:px-10 md:py-20">
              <span
                className={`
                  rounded-sm
                  px-2
                  py-1
                  font-mono
                  text-[0.6875rem]
                  font-bold
                  tracking-[0.06em]
                  ${typeTabClasses[practice.type]}
                `}
              >
                {practice.type}
              </span>

              <h1
                className="
                  mt-6
                  max-w-140
                  font-display
                  text-[clamp(1.75rem,3vw,2.4rem)]
                  font-medium
                  leading-[1.12]
                  tracking-[-0.03em]
                  text-fg
                "
              >
                {practice.title}
              </h1>

              {practice.minutes && (
                <div className="mt-5 inline-flex items-center gap-2 font-mono text-xs text-fg-muted">
                  <Clock3 className="size-4" strokeWidth={1.6} />
                  <span>≈ {practice.minutes} min</span>
                </div>
              )}

              <div className="mt-9 flex items-center gap-2 text-fg-muted">
                <Sparkle className="size-3.5 animate-pulse" strokeWidth={1.6} />
                <span className="text-xs">{t("tapToBegin")}</span>
              </div>
            </div>
          </button>
        </div>

        {/* BACK — the content: the full practice, its source, and the
            action that files it */}
        <div className="flip-face flip-face-back">
          <div
            className="
              flex
              w-full
              flex-col
              overflow-hidden
              rounded-lg
              border border-border
              bg-surface
              shadow-card
            "
          >
            <header
              className="
                flex
                items-center
                justify-between
                gap-4
                border-b border-border
                px-7
                py-4
                md:px-10
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  aria-label={t("showCover")}
                  className="
                    grid
                    size-7
                    shrink-0
                    place-items-center
                    rounded-sm
                    text-fg-muted
                    transition-colors
                    duration-pill
                    ease-standard
                    hover:bg-bg
                    hover:text-fg
                  "
                >
                  <RotateCcw className="size-4" strokeWidth={1.7} />
                </button>

                <p className="min-w-0 truncate text-xs text-fg-muted">
                  {journeyTitle}
                  {phaseLabel && ` · ${phaseLabel}`}
                </p>
              </div>

              <p className="shrink-0 font-mono text-xs text-fg-muted">
                {currentDate}
              </p>
            </header>

            <div className="px-7 py-10 md:px-10 md:py-12">
              <h2
                className="
                  max-w-140
                  font-display
                  text-2xl
                  font-medium
                  leading-[1.15]
                  tracking-[-0.02em]
                  text-fg
                "
              >
                {practice.title}
              </h2>

              <p className="mt-6 max-w-140 text-base leading-7 text-fg">
                {practice.body}
              </p>

              {practice.minutes && (
                <div className="mt-7 inline-flex items-center gap-2 font-mono text-xs text-fg-muted">
                  <Clock3 className="size-4" strokeWidth={1.6} />
                  <span>≈ {practice.minutes} min</span>
                </div>
              )}

              <div className="mt-9 max-w-120 border-s-2 border-accent/30 ps-4">
                <p className="text-xs leading-5 text-fg-muted italic">
                  Naming creates space. In that space, you get to choose
                  your next step.
                </p>
              </div>
            </div>

            {/* Citation rule — attribution, day count, and the file
                action all live on this one bottom line. */}
            <div
              className="
                flex
                flex-col
                gap-5
                border-t border-border
                bg-bg/40
                px-7
                py-6
                md:flex-row
                md:items-center
                md:justify-between
                md:px-10
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`
                    shrink-0
                    rounded-sm
                    px-2
                    py-1
                    font-mono
                    text-[0.6875rem]
                    font-bold
                    tracking-[0.06em]
                    ${typeTabClasses[practice.type]}
                  `}
                >
                  {practice.type}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-xs text-fg-muted">
                    {practiceLabels[practice.type]}
                  </p>

                  {citation && (
                    <p className="mt-0.5 truncate font-mono text-xs text-fg-muted">
                      — {citation}
                    </p>
                  )}

                  <p className="mt-0.5 font-mono text-xs text-fg-muted">
                    Day {dayIndex} of {totalPractices}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {done ? (
                  <div
                    className={`
                      flex
                      h-11
                      items-center
                      gap-2
                      rounded-md
                      border border-brass/30
                      bg-brass/10
                      px-4
                      font-mono
                      text-sm
                      font-bold
                      tracking-[0.02em]
                      text-brass
                      ${justFiled ? "animate-card-stamp" : ""}
                    `}
                  >
                    <CheckCircle2 className="size-4" strokeWidth={1.8} />
                    {t("filed")}
                  </div>
                ) : failed ? (
                  <Button
                    type="button"
                    onClick={file}
                    variant="outline"
                    className="h-11 rounded-md border-border bg-transparent px-4 text-sm font-medium text-fg shadow-none hover:bg-bg"
                  >
                    {t("retryFile")}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="
                        h-11
                        rounded-md
                        border-border
                        bg-transparent
                        px-4
                        text-sm
                        font-medium
                        text-fg
                        shadow-none
                        hover:bg-bg
                      "
                    >
                      {t("notToday")}
                    </Button>

                    <Button
                      type="button"
                      onClick={file}
                      disabled={isPending}
                      className="
                        h-11
                        shrink
                        rounded-md
                        bg-accent
                        px-4
                        text-sm
                        font-medium
                        text-accent-fg
                        shadow-accent
                        transition
                        hover:bg-accent/90
                        disabled:opacity-60
                      "
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          {t("completing")}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" strokeWidth={1.7} />
                          {t("markAsDone")}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
