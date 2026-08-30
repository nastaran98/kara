"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { completePracticeAction } from "@/server/actions/practice.actions";

type CompletePracticeButtonProps = {
  userId: string;
  userJourneyId: string;
  practiceId: string;
  className?: string;
};

export function CompletePracticeButton({
  userId,
  userJourneyId,
  practiceId,
  className,
}: CompletePracticeButtonProps) {
  const locale = useLocale();
  const t = useTranslations("Practice");

  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await completePracticeAction(
        locale,
        userId,
        userJourneyId,
        practiceId
      );
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        `
          h-12
          w-full
          rounded-md
          bg-accent
          text-sm
          font-medium
          text-accent-fg
          shadow-[0_5px_14px_rgba(172,116,89,0.16)]
          transition
          hover:bg-accent/90
          disabled:opacity-60
        `,
        className
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {t("completing")}
        </>
      ) : (
        <>
          <CheckCircle2 className="size-5" strokeWidth={1.7} />
          {t("markAsDone")}
        </>
      )}
    </Button>
  );
}